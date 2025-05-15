(defproject beat-link-api "0.1.0-SNAPSHOT"
  :description "Beat Link API for PRO DJ Link devices" 
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [org.deepsymmetry/beat-link "0.6.3"]
                 [http-kit "2.6.0"]
                 [compojure "1.7.0"]
                 [ring/ring-defaults "0.3.4"]
                 [cheshire "5.11.0"]
                 [hiccup "1.0.5"]
                 [javax.xml.bind/jaxb-api "2.3.1"]
                 [org.slf4j/slf4j-nop "1.7.32"]]
  :main beat-link-api.core
  :aot :all
  :uberjar-name "beat-link-api-standalone.jar"
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})