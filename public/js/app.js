define(['lib/dependency_manager'], function (dm) {
  var dependencyManager = dm.init({
    css: App.css,
    js: App.js
  });

  ["css", "js"].forEach(function (type) {
    dependencyManager.getLibraries(type).forEach(function (library) {
      console.log("Library " + library.name + " has " + library.versions.length + " versions");
    });
  });

  return {
    dm: dependencyManager,
    doctypes: App.doctypes,
  };
});
