(ns beat-link-api.core
  (:require
   [cheshire.core :as json]
   [clojure.java.io :as clojure.java.io]
   [compojure.core :as compojure]
   [compojure.route :as route]
   [org.httpkit.server :as server]
   [ring.middleware.defaults :as ring-defaults])
  (:import
   [java.io ByteArrayInputStream ByteArrayOutputStream]
   [javax.imageio ImageIO]
   [org.deepsymmetry.beatlink
    CdjStatus
    CdjStatus$TrackSourceSlot
    DeviceAnnouncement
    DeviceFinder
    Util
    VirtualCdj]
   [org.deepsymmetry.beatlink.data
    AlbumArt
    ArtFinder
    BeatGridFinder
    MetadataFinder
    SearchableItem
    SignatureFinder
    TimeFinder
    TrackMetadata
    WaveformFinder])
  (:gen-class))

;; Initialize DJ Link components
(def device-finder (DeviceFinder/getInstance))
(def virtual-cdj (VirtualCdj/getInstance))
(def metadata-finder (MetadataFinder/getInstance))
(def signature-finder (SignatureFinder/getInstance))
(def time-finder (TimeFinder/getInstance))
(def waveform-finder (WaveformFinder/getInstance))
(def beatgrid-finder (BeatGridFinder/getInstance))
(def art-finder (ArtFinder/getInstance))

;; Server state
(def server-instance (atom nil))
(def simulated-params (atom nil))

(defn get-device-finder [] device-finder)
(defn get-virtual-cdj [] virtual-cdj)
(defn get-metadata-finder [] metadata-finder)
(defn get-signature-finder [] signature-finder)
(defn get-time-finder [] time-finder)
(defn get-waveform-finder [] waveform-finder)
(defn get-beatgrid-finder [] beatgrid-finder)
(defn get-art-finder [] art-finder)
(defn get-simulated-params [] @simulated-params)
(defn set-simulated-params! [params] (reset! simulated-params params))

;; Helper functions
(defn item-label
  "Given a searchable item, if it is not nil, returns its label."
  [^SearchableItem item]
  (when item (.label item)))

(defn format-source-slot
  "Converts the Java enum value representing the slot from which a track
  was loaded to a nice human-readable string."
  [slot]
  (condp = slot
    CdjStatus$TrackSourceSlot/NO_TRACK   "No Track"
    CdjStatus$TrackSourceSlot/CD_SLOT    "CD Slot"
    CdjStatus$TrackSourceSlot/SD_SLOT    "SD Slot"
    CdjStatus$TrackSourceSlot/USB_SLOT   "USB Slot"
    CdjStatus$TrackSourceSlot/COLLECTION "rekordbox"
    "Unknown Slot"))

(defn format-time
  "Formats a number of milliseconds as a time display."
  [ms]
  (let [minutes      (long (/ ms 60000))
        seconds      (long (/ (mod ms 60000) 1000))
        half-frames  (mod (Util/timeToHalfFrame ms) 150)
        frames       (long (/ half-frames 2))
        frame-tenths (if (even? half-frames) 0 5)]
    {:raw-milliseconds ms
     :minutes          minutes
     :seconds          seconds
     :frames           frames
     :frame-tenths     frame-tenths
     :display          (format "%02d:%02d:%02d.%d" minutes seconds frames frame-tenths)}))

(defn format-metadata
  "Builds a map describing the metadata of the track loaded in a player."
  [^Long player]
  (when-let [^TrackMetadata metadata (.getLatestMetadataFor metadata-finder player)]
    {:id              (.. metadata trackReference rekordboxId)
     :slot            (format-source-slot (.. metadata trackReference slot))
     :title           (.getTitle metadata)
     :album           (item-label (.getAlbum metadata))
     :artist          (item-label (.getArtist metadata))
     :comment         (.getComment metadata)
     :duration        (.getDuration metadata)
     :genre           (item-label (.getGenre metadata))
     :key             (item-label (.getKey metadata))
     :label           (item-label (.getLabel metadata))
     :original-artist (item-label (.getOriginalArtist metadata))
     :rating          (.getRating metadata)
     :remixer         (item-label (.getRemixer metadata))
     :starting-tempo  (/ (.getTempo metadata) 100.0)}))

(defn device-kind
  "Returns a keyword identifying the type of a device on a DJ Link network."
  [number]
  (cond
    (< number 0x10) :players
    (or (< number 0x20) (> number 0x28)) :collections
    :else :mixers))

(defn format-pitch
  "Formats a pitch percentage for display."
  [^Double pitch]
  (let [abs-pitch     (Math/abs pitch)
        format-string (if (< abs-pitch 20.0) "%5.2f" "%5.1f")
        formatted     (String/format java.util.Locale/ROOT format-string (to-array [abs-pitch]))
        sign          (if (= formatted " 0.00") " " (if (neg? pitch) "-" "+"))]
    (str sign formatted "%")))

(defn describe-status
  "Builds a parameter map with info from the latest status packet."
  [^Long number]
  (when-let [status (.getLatestStatusFor virtual-cdj number)]
    (let [bpm       (.getBpm status)
          bpm-valid (not= bpm 65535)]
      (merge
       ;; Basic information
       {:beat-within-bar  (when (.isBeatWithinBarMeaningful status) (.getBeatWithinBar status))
        :track-bpm        (when bpm-valid (/ bpm 100.0))
        :tempo            (when bpm-valid (.getEffectiveTempo status))
        :pitch            (Util/pitchToPercentage (.getPitch status))
        :pitch-display    (format-pitch (Util/pitchToPercentage (.getPitch status)))
        :pitch-multiplier (Util/pitchToMultiplier (.getPitch status))
        :is-synced        (.isSynced status)
        :is-tempo-master  (.isTempoMaster status)}

       ;; CDJ-specific information
       (when (instance? CdjStatus status)
         (let [status ^CdjStatus status]
           {:beat-number           (.getBeatNumber status)
            :cue-countdown         (.getCueCountdown status)
            :cue-countdown-display (.formatCueCountdown status)
            :firmware-version      (.getFirmwareVersion status)
            :track-number          (.getTrackNumber status)
            :track-source-player   (.getTrackSourcePlayer status)
            :is-at-end             (.isAtEnd status)
            :is-bpm-only-synced    (.isBpmOnlySynced status)
            :is-busy               (.isBusy status)
            :is-cued               (.isCued status)
            :is-looping            (.isLooping status)
            :is-on-air             (.isOnAir status)
            :is-paused             (.isPaused status)
            :is-playing            (.isPlaying status)
            :is-playing-backwards  (.isPlayingBackwards status)
            :is-playing-cdj-mode   (.isPlayingCdjMode status)
            :is-playing-forwards   (.isPlayingForwards status)
            :is-playing-vinyl-mode (.isPlayingVinylMode status)
            :is-searching          (.isSearching status)
            :is-track-loaded       (.isTrackLoaded status)}))))))

(defn describe-times
  "Gets playback and remaining time for a player."
  [^Long number]
  (when (.isRunning time-finder)
    (let [played (.getTimeFor time-finder number)]
      (when-not (neg? played)
        (merge {:time-played (format-time played)}
               (when-let [detail (.getLatestDetailFor waveform-finder number)]
                 (let [remain (max 0 (- (.getTotalTime detail) played))]
                   {:time-remaining (format-time remain)})))))))

(defn describe-device
  "Builds a template parameter map entry describing a device."
  [^DeviceAnnouncement device]
  (let [number (.getDeviceNumber device)]
    (merge {:number  number
            :name    (.getDeviceName device)
            :address (.. device getAddress getHostAddress)
            :kind    (device-kind number)}
           (when-let [metadata (format-metadata number)]
             {:track metadata})
           (describe-status number)
           (describe-times number))))

(defn build-params
  "Sets up the overlay template parameters based on current playback state."
  []
  (if (.isRunning virtual-cdj)
    (merge  ; Real data
     (reduce (fn [result device]
               (assoc-in result [(:kind device) (:number device)] device))
             {}
             (map describe-device (.getCurrentDevices device-finder)))
     (when-let [master (.getTempoMaster virtual-cdj)]
       {:master (describe-device (.getLatestAnnouncementFrom device-finder (.getDeviceNumber master)))}))
    @simulated-params))  ; Simulated data when offline

;; Route handlers
(defn return-params
  "Returns current DJ data as JSON."
  [_]
  (try
    (let [params (build-params)]
      {:status  200
       :headers {"Content-Type" "application/json"}
       :body    (json/encode params)})
    (catch Exception e
      (.printStackTrace e)
      {:status  500
       :headers {"Content-Type" "application/json"}
       :body    (json/encode {:error (.getMessage e)})})))

(defn return-artwork
  "Returns the artwork for a track on a player."
  [player icons]
  (let [player (Long/valueOf player)
        icons  (Boolean/valueOf icons)]
    (if-let [^AlbumArt art (.getLatestArtFor art-finder player)]
      (let [baos (ByteArrayOutputStream.)]
        (ImageIO/write (.getImage art) "jpg" baos)
        {:status  200
         :headers {"Content-Type" "image/jpeg"
                   "Cache-Control" "max-age=1"}
         :body    (ByteArrayInputStream. (.toByteArray baos))})
      {:status  200  ; No art found, return placeholder
       :headers {"Content-Type" "image/png"
                 "Cache-Control" "max-age=1"}
       :body    (clojure.java.io/resource "placeholder.png")})))

(defn request-logger
  "Simple middleware that logs requests to the console."
  [handler]
  (fn [request]
    (println (str "[" (.format (java.text.SimpleDateFormat. "HH:mm:ss") (java.util.Date.)) "] "
                  (:request-method request) " "
                  (:uri request)
                  (when-let [q (:query-string request)] (str "?" q))))
    (handler request)))

;; App routes
(def app-routes
  (compojure/routes
   (compojure/GET "/" []
     {:status 200
      :headers {"Content-Type" "text/html"}
      :body (slurp (clojure.java.io/resource "index.html"))})
   (compojure/GET "/params.json" [] return-params)
   (compojure/GET "/artwork/:player{[0-9]+}" [player icons] (return-artwork player icons))
   (compojure/GET "/wave-preview/:player{[0-9]+}" [player width height]
     ((requiring-resolve 'beat-link-api.waveforms/return-wave-preview) player width height))
   (compojure/GET "/wave-detail/:player{[0-9]+}" [player width height scale]
     ((requiring-resolve 'beat-link-api.waveforms/return-wave-detail) player width height scale))
   (route/resources "/")
   (route/not-found "<p>Page not found.</p>")))

;; Create the app with middleware
(def app
  (-> app-routes
      (request-logger)
      (ring-defaults/wrap-defaults (assoc-in ring-defaults/api-defaults [:responses :content-types] false))))

;; DJ Link connection
(defn start-dj-link
  "Start all the PRO DJ LINK components."
  []
  (println "Connecting to PRO DJ LINK components...")
  (.start device-finder)
  (.setUseStandardPlayerNumber virtual-cdj true)  ; Better for metadata access
  (.start virtual-cdj)
  (.start beatgrid-finder)

  ;; Start data providers after VirtualCdj is running
  (when (.isRunning virtual-cdj)
    (.start metadata-finder)
    (.start signature-finder)
    (.start time-finder)
    (.start waveform-finder)
    (.start art-finder))

  (println "Connected to PRO DJ LINK successfully.")
  (println "Device number: " (.getDeviceNumber virtual-cdj))
  (println "Using standard player number: " (.getUseStandardPlayerNumber virtual-cdj)))

(defn stop-dj-link
  "Stop all the PRO DJ LINK components."
  []
  (println "Disconnecting from PRO DJ LINK components...")
  (.stop art-finder)
  (.stop waveform-finder)
  (.stop time-finder)
  (.stop signature-finder)
  (.stop metadata-finder)
  (.stop virtual-cdj)
  (.stop device-finder)
  (.stop beatgrid-finder)
  (println "Disconnected from PRO DJ LINK successfully."))

;; Server functions
(defn start-server
  "Start the HTTP server on the specified port."
  [port]
  (println "Starting server on port" port)
  (reset! server-instance (server/run-server app {:port port}))
  (println "Server started."))

(defn stop-server
  "Stop the HTTP server."
  []
  (when-let [stop-fn @server-instance]
    (println "Stopping server...")
    (stop-fn)
    (reset! server-instance nil)
    (println "Server stopped.")))

(defn -main
  "Main entry point for the application."
  [& args]
  (println "============================================")
  (println "  Beat Link API Starting...")
  (println "  Version: 1.0.0")
  (println "  Time: " (.format (java.text.SimpleDateFormat. "yyyy-MM-dd HH:mm:ss") (java.util.Date.)))
  (println "============================================")
  (println)

  (System/setProperty "java.awt.headless" "true")
  (let [simulate? (some #{"--simulate"} args)
        port-arg  (first (remove #{"--simulate"} args))
        port      (if port-arg
                    (Integer/parseInt port-arg)
                    17081)]
    (try
      (if simulate?
        (do
          (println "Running in simulation mode.")
          (require 'beat-link-api.simulator)
          ((resolve 'beat-link-api.simulator/start-simulation))
          ((resolve 'beat-link-api.simulator/update-simulation))
          (println "Simulation started successfully."))
        (do
          (println "Attempting to connect to PRO DJ LINK network...")
          (start-dj-link)))

      (println "Starting API server on port" port "...")
      (start-server port)
      (println)
      (println "Server is now running!")
      (println (str "Access the API JSON at: http://localhost:" port "/params.json"))
      (println)
      (println "Press Ctrl+C to stop the server")

      (.addShutdownHook (Runtime/getRuntime)
                        (Thread. (fn []
                                   (println)
                                   (println "Shutdown requested. Cleaning up resources...")
                                   (stop-server)
                                   (if simulate?
                                     (do
                                       (println "Stopping simulation...")
                                       ((resolve 'beat-link-api.simulator/stop-simulation)))
                                     (do
                                       (println "Disconnecting from PRO DJ LINK network...")
                                       (stop-dj-link)))
                                   (println "Shutdown complete."))))
      (catch Exception e
        (println)
        (println "ERROR: Failed to start Beat Link API:")
        (println (.getMessage e))
        (.printStackTrace e)
        (println)
        (println "Press Enter to exit...")
        (read-line)  ; Wait for user to press Enter before exiting
        (System/exit 1)))))