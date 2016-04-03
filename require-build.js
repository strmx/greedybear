({
    baseUrl: "build/js",
    paths: {
      requireLib: "../vendors/require",
      babylon: "../vendors/babylon",
      modernizr: "../vendors/modernizr",
      "rx": "../vendors/rx.all"
    },
    include: ["requireLib", "babylon", "modernizr", "rx"],
    name: "app",
    out: "build/bundle.js"
})
