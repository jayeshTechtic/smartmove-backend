const { translateTheText } = require("../../Utils/commonFile");
const CountryModel = require("../schema/country.schema");


const countryService = {
    async getCountryList() {
        try {
            return await CountryModel.find();
        } catch (error) {
            throw error
        }
    },

    async getCountryAndRegionByCountry(countryId) {
        try {
            return await CountryModel.findById(countryId);
        } catch (error) {
            throw error
        }
    },

    // async translateCountryAndRegionNames(response) {
    //     // console.log("translateCountryAndRegionNames::Response::::", response)
    //     for (let element in response) {
    //         if (response[element]?.country_name) {
    //             response[element]['country_name'] = await translateTheText(response[element]?.country_name);
    //             for (let elementValue in response[element].regions) {
    //                 if (response[element].regions[elementValue]?.region_name) {
    //                     response[element].regions[elementValue]['region_name'] = await translateTheText(response[element]?.regions[elementValue].region_name);
    //                 }
    //             }
    //         }
    //     }
    //     return response;
    // }

    async translateCountryAndRegionNames(response) {
        try {
            const translationPromises = [];

            for (let element in response) {
                if (response[element]?.country_name) {
                    translationPromises.push(
                        translateTheText(response[element]?.country_name)
                            .then(translatedCountryName => {
                                response[element]['country_name'] = translatedCountryName;
                            })
                            .catch(error => {
                                console.error("Error translating country name:", error);
                            })
                    );

                    const regionKeys = Object.keys(response[element].regions);
                    regionKeys.forEach(elementValue => {
                        if (response[element].regions[elementValue]?.region_name) {
                            translationPromises.push(
                                translateTheText(response[element].regions[elementValue]?.region_name)
                                    .then(translatedRegionName => {
                                        response[element].regions[elementValue]['region_name'] = translatedRegionName;
                                    })
                                    .catch(error => {
                                        console.error("Error translating region name:", error);
                                    })
                            );
                        }
                    });
                }
            }

            // Wait for all translation promises to resolve
            await Promise.all(translationPromises);
        } catch (error) {
            console.error("Error translating country and region names:", error);
        }

        return response;
    }
}

module.exports = countryService;