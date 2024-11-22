const ReceiptSchema = require("../../schema/Receipt");
const FloorSchema = require("../../schema/Floor");
const TableSchema = require("../../schema/Table");
const RoomSchema = require("../../schema/Room");

const GetRoomsList = async (req, res) => {
  try {
    const { date: searchDate, time: searchTime } = req.body;

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
    const bookedRoomIds = bookedReceipts.map((receipt) => receipt.room?.toString());

    // Step 3: Retrieve all tables and rooms
    const allTables = await TableSchema.find();
    const allRooms = await RoomSchema.find();
    const allFloors = await FloorSchema.find();

    // Step 4: Filter out booked tables and rooms
    const availableTables = allTables.filter(
      (table) => !bookedTableNumbers.includes(table.table_number)
    );

    console.log("availableTables",availableTables);
    

    const availableRooms = allRooms.filter(
      (room) => room._id && !bookedRoomIds.includes(room._id.toString())
    );

    // Step 5: Combine floors, rooms, and tables into a structured response
    const availableFloorData = allFloors.map((floor) => {
      const floorRooms = availableRooms
        .filter((room) => room.floor_id?.toString() === floor._id.toString())
        .map((room) => {
          const roomTables = availableTables.filter(
            (table) => table.room?.toString() !== room._id.toString()
          );

          console.log("roomTables",roomTables);
          

          return {
            _id: room._id,
            room_name: room.room_name,
            tables: roomTables,
          };
        });

      return {
        _id: floor._id,
        floor_name: floor.floor_name,
        rooms: floorRooms,
      };
    });

    // Step 6: Respond with the available floors, rooms, and tables
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
