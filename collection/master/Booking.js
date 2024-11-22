const ReceiptSchema = require("../../schema/Receipt");
const FloorSchema = require("../../schema/Floor");
const TableSchema = require("../../schema/Table");
const RoomSchema = require("../../schema/Room");

const GetRoomsList = async (req, res) => {
  try {
    const { date: searchDate, time: searchTime } = req.body; // Destructuring the date and time from the request body

    if (!searchDate || !searchTime) {
      return res.status(400).json({
        message: "Both date and time are required.",
      });
    }

    // Step 1: Find all receipts matching the provided date and time
    const bookedReceipts = await ReceiptSchema.find({
      date: searchDate,
      time: searchTime,
    });

    // Step 2: Extract booked table numbers and room IDs
    const bookedTableNumbers = bookedReceipts.map((receipt) => receipt.table_number);
    const bookedRoomIds = bookedReceipts.map((receipt) => receipt.room_id); // Assuming `room_id` is stored in receipts

    // Step 3: Retrieve all tables and rooms
    const allTables = await TableSchema.find();
    const allRooms = await RoomSchema.find();

    // Step 4: Filter out booked tables and rooms to find available ones
    const availableTables = allTables.filter(
      (table) => !bookedTableNumbers.includes(table.table_number)
    );

    const availableRooms = allRooms.filter(
      (room) => !bookedRoomIds.includes(room._id.toString())
    );

    // Step 5: Combine floors with tables and rooms for a hierarchical response
    const allFloors = await FloorSchema.find();
    const availableFloorData = allFloors.map((floor) => {
      const floorTables = availableTables.filter(
        (table) => table.floor_id.toString() === floor._id.toString()
      );
      const floorRooms = availableRooms.filter(
        (room) => room.floor_id.toString() === floor._id.toString()
      );

      return {
        floor_name: floor.floor_name,
        tables: floorTables,
        rooms: floorRooms,
      };
    });

    // Respond with the available tables and rooms
    res.status(200).json({
      statusCode: 200,
      available: availableFloorData,
    });
  } catch (error) {
    // Log and respond with an error
    console.error("Error retrieving available rooms:", error);

    res.status(500).json({
      message: "Error retrieving available rooms",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  GetRoomsList,
};
