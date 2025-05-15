(ns beat-link-api.waveforms
  (:require [beat-link-api.util :as util])
  (:import [java.awt Color Graphics2D RenderingHints]
           [java.awt.image BufferedImage]
           [java.io ByteArrayOutputStream ByteArrayInputStream]
           [javax.imageio ImageIO]
           [org.deepsymmetry.beatlink.data WaveformPreviewComponent WaveformDetailComponent]
           [org.deepsymmetry.beatlink.data WaveformFinder]))

;; Define atom references for waveform colors
(def wave-background-color (atom (Color. 0 0 0 0)))  ; Transparent black
(def wave-indicator-color (atom (Color. 255 255 255))) ; White
(def wave-emphasis-color (atom (Color. 41 217 185)))  ; Teal (#29D9B9)

(defn safe-parse-int
  "Safely parse an integer with a default value if parsing fails."
  [^String value default]
  (if value
    (try
      (Integer/valueOf value)
      (catch Throwable _
        default))
    default))

(defn return-wave-preview
  "Returns the waveform preview image for a player."
  [^String player width height]
  (let [metadata-finder (requiring-resolve 'beat-link-api.core/get-metadata-finder)
        time-finder (requiring-resolve 'beat-link-api.core/get-time-finder)
        waveform-finder (requiring-resolve 'beat-link-api.core/get-waveform-finder)
        beatgrid-finder (requiring-resolve 'beat-link-api.core/get-beatgrid-finder)]
    (if (.isRunning (metadata-finder))
      (let [player   (Integer/valueOf player)
            width    (util/safe-parse-int width 408)
            height   (util/safe-parse-int height 56)
            track    (.getLatestMetadataFor (metadata-finder) player)
            position (.getLatestPositionFor (time-finder) player)
            preview  (.getLatestPreviewFor (waveform-finder) player)]
        (if preview
          (let [component (WaveformPreviewComponent. preview track)
                min-size  (.getMinimumSize component)]
            (.setBounds component 0 0 (max width (.-width min-size)) (max height (.-height min-size)))
            (.setBackgroundColor component @wave-background-color)
            (.setIndicatorColor component @wave-indicator-color)
            (.setEmphasisColor component @wave-emphasis-color)
            (when position
              (.setPlaybackState component player (.-milliseconds position) (.-playing position)))
            (let [bi   (BufferedImage. (.. component getSize width) (.. component getSize height)
                                       BufferedImage/TYPE_INT_ARGB)
                  g    (.createGraphics bi)
                  baos (ByteArrayOutputStream.)]
              (.paint component g)
              (.dispose g)
              (javax.imageio.ImageIO/write bi "png" baos)
              {:status 200
               :headers {"Content-Type" "image/png"
                         "Cache-Control" "no-store"}
               :body (ByteArrayInputStream. (.toByteArray baos))}))
          {:status 200  ; No waveform preview available
           :headers {"Content-Type" "image/png"
                     "Cache-Control" "max-age=1"}
           :body (clojure.java.io/resource "placeholder.png")}))
      {:status 503  ; Not running
       :headers {"Content-Type" "application/json"}
       :body "{\"error\": \"Metadata finder not running\"}"})
))

(defn return-wave-detail
  "Returns the waveform detail image for a player."
  [^String player ^String width ^String height ^String scale]
  (let [metadata-finder (requiring-resolve 'beat-link-api.core/get-metadata-finder)
        time-finder (requiring-resolve 'beat-link-api.core/get-time-finder)
        waveform-finder (requiring-resolve 'beat-link-api.core/get-waveform-finder)
        beatgrid-finder (requiring-resolve 'beat-link-api.core/get-beatgrid-finder)]
    (if (.isRunning (metadata-finder))
      (let [player    (Integer/valueOf player)
            width     (safe-parse-int width 0)
            height    (safe-parse-int height 0)
            scale     (safe-parse-int scale 4)
            track     (.getLatestMetadataFor (metadata-finder) player)
            position  (.getLatestPositionFor (time-finder) player)
            detail    (.getLatestDetailFor (waveform-finder) player)]
        (if detail
          (let [component (WaveformDetailComponent. detail
                                                  (when track (.getCueList track))
                                                  (.getLatestBeatGridFor (beatgrid-finder) player))
                min-size  (.getMinimumSize component)]
            (.setBounds component 0 0 (max width (.-width min-size)) (max height (.-height min-size)))
            (.setBackgroundColor component @wave-background-color)
            (.setIndicatorColor component @wave-indicator-color)
            (.setEmphasisColor component @wave-emphasis-color)
            (.setScale component scale)
            (when position
              (.setPlaybackState component player (.-milliseconds position) (.-playing position)))
            (let [bi   (BufferedImage. (.. component getSize width)
                                     (.. component getSize height) BufferedImage/TYPE_INT_ARGB)
                  g    (.createGraphics bi)
                  baos (ByteArrayOutputStream.)]
              (.paint component g)
              (.dispose g)
              (javax.imageio.ImageIO/write bi "png" baos)
              {:status 200
               :headers {"Content-Type" "image/png"
                         "Cache-Control" "no-store"}
               :body (ByteArrayInputStream. (.toByteArray baos))}))
          {:status 200  ; No waveform detail available
           :headers {"Content-Type" "image/png"
                     "Cache-Control" "max-age=1"}
           :body (clojure.java.io/resource "placeholder.png")}))
      {:status 503  ; Not running
       :headers {"Content-Type" "application/json"}
       :body "{\"error\": \"Metadata finder not running\"}"})
))

;; Functions to update waveform colors
(defn set-wave-background-color [color]
  (reset! wave-background-color color))

(defn set-wave-indicator-color [color]
  (reset! wave-indicator-color color))

(defn set-wave-emphasis-color [color]
  (reset! wave-emphasis-color color))