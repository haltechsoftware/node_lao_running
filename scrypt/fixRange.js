import db from "../models";

// Optimize package range updates
db.Package.findAll()
  .then((packages) => {
    return Promise.all(
      packages.map(async (pack) => {
        // Set range based on package name
        const range = pack.name.includes("40KM") ? 40 : 90;

        // Update package range
        await pack.update({ range });

        console.log(pack);

        // Find all user IDs with this package
        const userPackages = await db.UserPackage.findAll({
          where: { package_id: pack.id },
          attributes: ["user_id"],
        });

        const userIds = userPackages.map((up) => up.user_id);

        if (userIds.length > 0) {
          // Bulk update all user profiles at once
          await db.UserProfile.update(
            { range: pack.range.toString() },
            { where: { user_id: userIds } },
          );
        }
      }),
    );
  })
  .then(() => {
    console.log("Package ranges updated successfully");
  })
  .catch((error) => {
    console.error("Error updating package ranges:", error);
  });
