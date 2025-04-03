require('dotenv').config()
const csvtoJSON = require('csvtojson')
const {db} = require('../config/db')

const uploadcsv = async (req,res) => {
    try {
        console.log('Uplaod CSV API')
        if(!req.file){
            return res.status(404).json({success : false , message : "Upload a csv file !"})
        }
        const filePath = req.file.filePath

        const jsonArray = await csvtoJSON().fromFile(filePath)
        if(jsonArray.length === 0){
            return res.status(400).josn({ success : false , message : "CSV file is Empty !"})
        }

        const order_number = []
        const duplicate_order_number = []

        jsonArray.map((info)=>{
            if(order_number.indexOf(info.order_no)!=- 1){
                duplicate_order_number.push(info.order_no)
            } else {
                order_number.push(info.order_no)
            }
        })

        if(duplicate_order_number.length > 0){
            return res.status(404).json({
                success : false,
                message : "Duplicate record !",
                data : {duplicateOrder : duplicate_order_number}
            })
        }

        let invalid_order = []
        let created_order = []

        let validate_record = await Promise.all(jsonArray.map((info)=>{
            return new Promise(async(resolve)=>{
                if(info.order_no && info.state_name && info.county_name && info.owner_name && info.unit_property_address && info.product){

                // Check If order_number already exists or not
                const [order_data] = await db.execute(`SELECT id from orders WHERE order_no = '${info.order_no}'`)
                if(order_data.length > 0){          // checking for already exisitng record
                    info.message = 'Order already exists'
                    invalid_order.push(info)
                    return resolve(false)
                }

                // Check for State name
                const [state_data] = await db.execute(`SELECT id from states WHERE state_name = '${info.state_name}'`)
                if(state_data.length == 0){          // No match in the record
                    info.message = 'Invalid state name'
                    invalid_order.push(info)
                    return resolve(false)
                }

                // Check for county name
                const [county_name] = await db.execute(`SELECT id from counties WHERE county_name = '${info.county_name}' AND state_id = '${state_data[0].id}'`)
                if(county_name.length == 0){         // // No match in the record
                    info.message = 'Invalid County name and state ID'
                    invalid_order.push(info)
                    return resolve(false)
                }

                // Check for the product
                const [product_data] = await db.execute(`SELECT id from certificate_types WHERE name = '${info.product}'`)
                if(product_data.length == 0){
                    info.message = 'Invalid Product name'
                    invalid_order.push(info)
                    return resolve(false)
                }


                } else {

                }
            })
        }))



    } catch (error) {
        res.status(500).json({  error: 'Failed to process file', details: error.message })
    }
    
}


module.exports = uploadcsv
