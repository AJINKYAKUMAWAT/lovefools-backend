const ReceiptSchema = require("../../schema/Receipt");
const FloorSchema = require("../../schema/Floor");
const TableSchema = require("../../schema/Table");

const GetRoomsList = async (req, res) => {
  try {
    const searchDate = req.body.date; // Expected to be in a valid date format
    const searchTime = req.body.time; // Expected to be in a valid time format

    if (!searchDate || !searchTime) {
      return res.status(400).json({
        message: "Both date and time are required.",
      });
    }

    // Step 1: Find receipts matching the date and time
    const bookedReceipts = await ReceiptSchema.find({
      date: searchDate,
      time: searchTime,
    });

    console.log("bookedReceipts",bookedReceipts);
    

    // Extract booked floor and table numbers
    const booked = bookedReceipts.map((receipt) => ({
      floor: receipt.floor,
      table: receipt.seatCount,
    }));

    // Step 2: Retrieve all floor and table combinations
    const allFloors = await FloorSchema.find();
    const allTables = await TableSchema.find();

    // Flatten the structure to create a list of all floor and table combinations
    const allCombinations = [];
    // allFloors.forEach((floor) => {
    //   allTables.forEach((table) => {
    //     allCombinations.push({
    //       floor: floor.floor_name,
    //       table: table.table_number,
    //     });
    //   });
    // });

    const tableFilter = allTables.filter((res)=>{
      res.table_number === booked.table_number
    })

    console.log("findTable",booked);
    

    // Step 3: Filter out booked combinations
    const availableCombinations = allCombinations.filter(
      (combo) =>
        !bookedReceipts.some(
          (b) =>
            b.floor === combo.floor &&
            b.table === combo.table
        )
    );

    // Step 4: Respond with the available combinations
    res.status(200).json({
      StatusCode: 200,
      available: availableCombinations,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving available rooms:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving available rooms",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  GetRoomsList,
};
