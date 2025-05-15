(ns beat-link-api.simulator
  (:require [beat-link-api.core :as core]
            [clojure.string :as str])
  (:import [java.util Date]))

(def simulated-players
  "A map from player number to simulated track data."
  (atom {1 {:number 1
            :name "CDJ-2000NXS2"
            :address "127.0.0.1"
            :kind :players
            :track {:title "Sample Track 1"
                    :artist "Sample Artist 1"
                    :album "Sample Album"
                    :genre "House"
                    :duration 360}
            :beat-within-bar 1
            :track-bpm 128.0
            :tempo 128.0
            :pitch 0.0
            :pitch-display "+0.00%"
            :pitch-multiplier 1.0
            :is-synced false
            :is-tempo-master true
            :beat-number 128
            :is-on-air true
            :is-playing true}
         2 {:number 2
            :name "CDJ-2000NXS2"
            :address "127.0.0.1"
            :kind :players
            :track {:title "Sample Track 2"
                    :artist "Sample Artist 2"
                    :album "Another Album"
                    :genre "Techno"
                    :duration 420}
            :beat-within-bar 3
            :track-bpm 130.0
            :tempo 130.0
            :pitch 0.0
            :pitch-display "+0.00%"
            :pitch-multiplier 1.0
            :is-synced true
            :is-tempo-master false
            :beat-number 64
            :is-on-air true
            :is-playing true}}))

(defn start-simulation
  "Start a simulation mode with fake DJ data."
  []
  (reset! core/simulated-params
          {:players @simulated-players
           :master (get @simulated-players 1)})
  (println "DJ Link simulation started."))

(defn stop-simulation
  "Stop the simulation mode."
  []
  (reset! core/simulated-params nil)
  (println "DJ Link simulation stopped."))

(defn update-simulation
  "Update simulated data periodically to make it look alive."
  []
  (let [update-fn (fn []
                    (swap! simulated-players update-in [1 :beat-number]
                           (fn [n] (inc (mod n 128))))
                    (swap! simulated-players update-in [2 :beat-number]
                           (fn [n] (inc (mod n 128))))
                    (swap! simulated-players update-in [1 :beat-within-bar]
                           (fn [n] (inc (mod n 4))))
                    (swap! simulated-players update-in [2 :beat-within-bar]
                           (fn [n] (inc (mod n 4))))
                    (reset! core/simulated-params
                            {:players @simulated-players
                             :master (get @simulated-players 1)}))]
    (doto (Thread.
           (fn []
             (loop []
               (try
                 (Thread/sleep 500)  ; Update every half second
                 (update-fn)
                 (catch Exception e
                   (println "Error in simulation:" (.getMessage e))))
               (recur))))
      (.setDaemon true)
      (.start))))