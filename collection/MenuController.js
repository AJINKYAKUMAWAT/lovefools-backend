const MenuSchema = require("../schema/Menu");

const AddMenuData = async (req, res) => {
  try {
    // Create a new instance of the Event model with the request body
    const newMenu = new MenuSchema(req.body);

    // Save the event to the database
    const savedEvent = await newMenu.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedEvent._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding menu", error });
  }
};

const UpdateMenuData = async (req, res) => {
  try {
    const menuId = req.params.menuId;

    // Check if eventId is provided
    if (!menuId) {
      return res.status(400).json({ message: "Menu ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedMenu = await MenuSchema.findOneAndUpdate(
      { _id: menuId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedMenu) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Menu not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedMenu });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating menu", error });
  }
};

const GetMenuList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    // If searchKey is provided, ensure an exact match for menuType
    const query = searchKey
      ? {
		$or: [
			{ subMenuType: { $regex: searchKey, $options: "i" } },
			{ menuType: { $regex: searchKey, $options: "i" } },
			{ menu_Name: { $regex: searchKey, $options: "i" } },
		  ]
        } // Exact match for menuType
      : {};

    const totalEvents = await MenuSchema.countDocuments(query);

    const menu = await MenuSchema.find(query)
      .collation({ locale: "en", strength: 2 }) // Ensures case-insensitive collation for sorting
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: menu,
      pageData: {
        total: totalEvents,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving menu:", error);

    res.status(500).json({
      message: "Error retrieving menu",
      error: error.message || "Unknown error",
    });
  }
};

const DeleteMenu = async (req, res) => {
  try {
    const menuId = req.params.menuId; // Accessing the query parameter from the URL

    if (!menuId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Menu ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedMenu = await MenuSchema.findByIdAndDelete(menuId);

    if (!deletedMenu) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Menu not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Menu deleted successfully",
      data: deletedMenu,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting menu:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting menu",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddMenuData,
  UpdateMenuData,
  GetMenuList,
  DeleteMenu,
};
