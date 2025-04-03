require('dotenv').config()
const csvtoJSON = require('csvtojson')
const {db} = require('../config/db')

// const uploadcsv = async (req,res) => {
//     try {
//         console.log('Uplaod CSV API')
//         if(!req.file){
//             return res.status(404).json({success : false , message : "Upload a csv file !"})
//         }
//         const filePath = req.file.filePath

//         const jsonArray = await csvtoJSON().fromFile(filePath)
//         if(jsonArray.length === 0){
//             return res.status(400).josn({ success : false , message : "CSV file is Empty !"})
//         }

//         const order_number = []
//         const duplicate_order_number = []

//         jsonArray.map((info)=>{
//             if(order_number.indexOf(info.order_no)!=- 1){
//                 duplicate_order_number.push(info.order_no)
//             } else {
//                 order_number.push(info.order_no)
//             }
//         })

//         if(duplicate_order_number.length > 0){
//             return res.status(404).json({
//                 success : false,
//                 message : "Duplicate record !",
//                 data : {duplicateOrder : duplicate_order_number}
//             })
//         }

//         let invalid_order = []
//         let created_order = []

//         let validate_record = await Promise.all(jsonArray.map((info)=>{
//             return new Promise(async(resolve)=>{
//                 if(info.order_no && info.state_name && info.county_name && info.owner_name && info.unit_property_address && info.product){

//                 // Check If order_number already exists or not
//                 const [order_data] = await db.execute(`SELECT id from orders WHERE order_no = '${info.order_no}'`)
//                 if(order_data.length > 0){          // checking for already exisitng record
//                     info.message = 'Order already exists'
//                     invalid_order.push(info)
//                     return resolve(false)
//                 }

//                 // Check for State name
//                 const [state_data] = await db.execute(`SELECT id from states WHERE state_name = '${info.state_name}'`)
//                 if(state_data.length == 0){          // No match in the record
//                     info.message = 'Invalid state name'
//                     invalid_order.push(info)
//                     return resolve(false)
//                 }

//                 // Check for county name
//                 const [county_name] = await db.execute(`SELECT id from counties WHERE county_name = '${info.county_name}' AND state_id = '${state_data[0].id}'`)
//                 if(county_name.length == 0){         // // No match in the record
//                     info.message = 'Invalid County name and state ID'
//                     invalid_order.push(info)
//                     return resolve(false)
//                 }

//                 // Check for the product
//                 const [product_data] = await db.execute(`SELECT id from certificate_types WHERE name = '${info.product}'`)
//                 if(product_data.length == 0){
//                     info.message = 'Invalid Product name'
//                     invalid_order.push(info)
//                     return resolve(false)
//                 }
//                 let order_insert_data = JSON.stringify({
//                     "order_no" : info.order_data,
//                     "state_id" : state_data[0].id,
//                     "county_id" : county_name[0].id,
//                     "padd" : info.unit_property_address ? info.unit_property_address : "",
//                     "on" : info.owner_name ? info.owner_name : "",
//                     "certificate_type" : product_data[0].id
//                 })
//                 console.log(order_insert_data)
//                 await db.execute(`INSERT into orders (data) values (?)`,[order_insert_data])
//                 info.message = "order created Successfully!"
//                 created_order.push(info)
//                 } else {
//                     let message = "Missing"
//                     if(!info.order_no) {
//                         message+= " order number"
//                     }
//                     if(!info.state_name){
//                         message+= " state name"
//                     }
//                     if(!info.county_name){
//                         message+= " county name"
//                     }
//                     if(!info.owner_name){
//                         message+= " owner name"
//                     }
//                     if(!info.unit_property_address){
//                         message+= " unit property address"
//                     }
//                     if(!info.product){
//                         message+= " certificate type"
//                     }
//                     info.message = message
//                     invalid_order.push(info)
//                 }
//             })
//         }))



//     } catch (error) {
//         res.status(500).json({  error: 'Failed to process file', details: error.message })
//     }
    
// }

const uploadcsv = async (req, res) => {
    try {
        console.log("Upload CSV API");

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Upload a CSV file!" });
        }

        const filePath = req.file.path; // Corrected file path access
        const jsonArray = await csvtoJSON().fromFile(filePath);

        if (jsonArray.length === 0) {
            return res.status(400).json({ success: false, message: "CSV file is Empty!" });
        }

        const order_number = new Set();
        const duplicate_order_number = [];

        jsonArray.forEach((info) => {
            if (order_number.has(info.order_no)) {
                duplicate_order_number.push(info.order_no);
            } else {
                order_number.add(info.order_no);
            }
        });

        if (duplicate_order_number.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Duplicate record!",
                data: { duplicateOrders: duplicate_order_number }
            });
        }

        let invalid_order = [];
        let created_order = [];

        for (const info of jsonArray) {
            if (info.order_no && info.state_name && info.county_name && info.owner_name && info.unit_property_address && info.product) {
                try {
                    // Check if order already exists
                    const [order_data] = await db.execute(
                        `SELECT id FROM orders WHERE JSON_EXTRACT(data, '$.order_no') = ?`,
                        [info.order_no]
                    );
                    if (order_data.length > 0) {
                        info.message = "Order already exists";
                        invalid_order.push(info);
                        continue;
                    }

                    // Check for State name
                    const [state_data] = await db.execute(
                        `SELECT id FROM states WHERE state_name = ?`,
                        [info.state_name]
                    );
                    if (state_data.length === 0) {
                        info.message = "Invalid state name";
                        invalid_order.push(info);
                        continue;
                    }

                    // Check for county name
                    const [county_data] = await db.execute(
                        `SELECT id FROM counties WHERE county_name = ? AND state_id = ?`,
                        [info.county_name, state_data[0].id]
                    );
                    if (county_data.length === 0) {
                        info.message = "Invalid county name and state ID";
                        invalid_order.push(info);
                        continue;
                    }

                    // Check for the product
                    const [product_data] = await db.execute(
                        `SELECT id FROM certificate_types WHERE name = ? AND is_active = 1`,
                        [info.product]
                    );
                    if (product_data.length === 0) {
                        info.message = "Invalid product name";
                        invalid_order.push(info);
                        continue;
                    }

                    // Store data in JSON format
                    const order_insert_data = JSON.stringify({
                        order_no: info.order_no,
                        state_id: state_data[0].id,
                        county_id: county_data[0].id,
                        padd: info.unit_property_address || "",
                        on: info.owner_name || "",
                        certificate_type_id: product_data[0].id
                    });

                    await db.execute(`INSERT INTO orders (data) VALUES (?)`, [order_insert_data]);

                    info.message = "Order created successfully!";
                    created_order.push(info);
                } catch (dbError) {
                    console.error("DB Error:", dbError);
                    info.message = "Database error";
                    invalid_order.push(info);
                }
            } else {
                let message = "Missing: ";
                if (!info.order_no) message += " Order Number,";
                if (!info.state_name) message += " State Name,";
                if (!info.county_name) message += " County Name,";
                if (!info.owner_name) message += " Owner Name,";
                if (!info.unit_property_address) message += " Unit Property Address,";
                if (!info.product) message += " Certificate Type,";
                info.message = message.replace(/,$/, ""); // Remove trailing comma
                invalid_order.push(info);
            }
        }

        return res.status(200).json({
            success: true,
            message: "CSV processed successfully!",
            data: {
                invalid_orders: invalid_order,
                created_orders: created_order
            }
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Failed to process file", details: error.message });
    }
};



module.exports = uploadcsv
