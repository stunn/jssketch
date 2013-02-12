define(['lib/dependency_manager'], function (dm) {
  console.log("DependencyManager loaded!");

  var manager = dm.init({
    css: App.css,
    js: App.js
  });

  ["css", "js"].forEach(function (type) {
    manager.getLibraries(type).forEach(function (library) {
      console.log("Library " + library.name + " has " + library.versions.length + " versions");
    });
  });
});