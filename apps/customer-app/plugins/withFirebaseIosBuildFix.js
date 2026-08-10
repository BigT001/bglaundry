const { withPodfile } = require("expo/config-plugins");

const STATIC_FRAMEWORK_FLAG = "$RNFirebaseAsStaticFramework = true";
const POST_INSTALL_FIX = `    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
`;

module.exports = function withFirebaseIosBuildFix(config) {
  return withPodfile(config, (podfileConfig) => {
    let contents = podfileConfig.modResults.contents;

    if (!contents.includes(STATIC_FRAMEWORK_FLAG)) {
      contents = contents.replace(
        "prepare_react_native_project!\n",
        `prepare_react_native_project!\n\n${STATIC_FRAMEWORK_FLAG}\n`,
      );
    }

    if (
      !contents.includes(
        "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES",
      )
    ) {
      const postInstallEnd = contents.lastIndexOf("  end\nend");
      if (postInstallEnd === -1) {
        throw new Error(
          "Unable to locate the CocoaPods post_install block for the Firebase iOS build fix.",
        );
      }

      contents =
        contents.slice(0, postInstallEnd) +
        POST_INSTALL_FIX +
        contents.slice(postInstallEnd);
    }

    podfileConfig.modResults.contents = contents;
    return podfileConfig;
  });
};
