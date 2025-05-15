(ns beat-link-api.util)

;; Safe parse for integers with default value
(defn safe-parse-int
  "Safely parse an integer with a default value if parsing fails."
  [^String value default]
  (if value
    (try
      (Integer/valueOf value)
      (catch Throwable _
        default))
    default))

;; Add any other utility functions that both namespaces need