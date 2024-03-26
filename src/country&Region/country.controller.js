const { statusCode } = require("../../Utils/const");
const {
    printConsole,
    translateTheText,
    setGlobalLanguage,
} = require("../../Utils/commonFile");
const CountryModel = require("../schema/country.schema");
const countryService = require("./country.service");


// const addCountry = async (req, res) => {
//     try {
//         // Assuming req.body contains the array of objects you provided
//         const data = req.body;

//         // Correct the field name to match the schema
//         const formattedData = data.map(country => ({
//             country_name: country.country_name,
//             display_name: country.display_name,
//             regions: country.region,  // Corrected field name
//         }));

//         // Insert data into the MongoDB collection
//         await CountryModel.insertMany(formattedData);

//         res.status(201).json({ statusCode: statusCode.sucess, message: await translateTheText('Data inserted successfully') });
//     } catch (error) {
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error"),
//         });
//     }
// }

const getCountryAndRegion = async (req, res) => {
    try {
        const { decoded } = req;
        if (decoded && Object.values(decoded)?.length) {
            await setGlobalLanguage(decoded.user_id);
        }

        if (!req.query.countryId) {
            response = await countryService.getCountryList();
            // return await countryService
            //     .getCountryList()
            //     .then(async (response) => {
            //         response = await countryService.translateCountryAndRegionNames(response)
            //         return res.status(200).json({
            //             statusCode: statusCode.sucess,
            //             message: await translateTheText(
            //                 "Successfully got the country list"
            //             ),
            //             data: response,
            //         });
            //     });
        } else {
            response = await countryService.getCountryAndRegionByCountry(req.query.countryId);
        }

        response = req?.headers?.authorization && process.env.USER_SELECTED_LANGUAGE !== "de" ? await countryService.translateCountryAndRegionNames(response) : response;

        return res.status(200).json({
            statusCode: statusCode.success,
            message: await translateTheText(
                req.query.countryId ? "Successfully got the country with region lists" : "Successfully got the country list"
            ),
            data: response,
        });

        // return await countryService
        //     .getCountryAndRegionByCountry(req.query.country)
        //     .then(async (response) => {
        //         response = await countryService.translateCountryAndRegionNames(response)
        //         return res.status(200).json({
        //             statusCode: statusCode.sucess,
        //             message: await translateTheText(
        //                 "Successfully got the country with region lists"
        //             ),
        //             data: response,
        //         });
        //     });

    } catch (error) {
        printConsole(error);
        res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText("Internal server error"),
        });
    }
}

module.exports = {
    //  addCountry, 
    getCountryAndRegion
}