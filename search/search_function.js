/* eslint-disable camelcase */
const removeDuplicates = function (array, key) {
    let lookup = {};
    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (!lookup[array[i][key]]) {
            lookup[array[i][key]] = true;
            result.push(array[i]);
        }
    }
    return result;
};

const replace_fullwidth_and_symbol = function (address) {
    address = address.replace(/\s/g, "");
    address = address.replace(/\[/g, "(");
    address = address.replace(/\]/g, ")");

    const replace_array = ["１", "２", "３", "４", "５", "６", "７", "８", "９", "０", "（", "）", "［", "］", "号", "～"];
    const alternative_array = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "(", ")", "(", ")", "號", "~"];

    for (let i = 0; i < address.length; i++) {
        const word_idx = replace_array.indexOf(address.charAt(i));
        if (word_idx !== -1) {
            const regex = new RegExp(replace_array[word_idx]);

            address = address.replace(regex, alternative_array[word_idx]);
        }
    }
    return address;
};

const number_change_words = function (address) {
    const word_array = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const number_array = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < address.length; i++) {
        if (
            (address.charAt(i) == "段" && !isNaN(address.charAt(i - 1))) ||
            (address.charAt(i) == "路" && !isNaN(address.charAt(i - 1))) ||
            (address.charAt(i) == "小" && !isNaN(address.charAt(i - 1)))
        ) {
            if (number_array.indexOf(address.charAt(i - 1)) !== -1) {
                let change_word = word_array[number_array.indexOf(address.charAt(i - 1))];

                address = address.substr(0, i - 1) + change_word + address.substr(i);
            }
        }
    }
    return address;
};

const word_change_number = function (address) {
    const word_array = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const number_array = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < address.length; i++) {
        if (address.charAt(i) == "號" && isNaN(address.charAt(i - 1))) {
            if (word_array.indexOf(address.charAt(i - 1)) !== -1) {
                let change_word = number_array[word_array.indexOf(address.charAt(i - 1))];
                address = address.substr(0, i - 1) + change_word + address.substr(i);
            }
        }
    }
    return address;
};

const full_search = function (search_word) {
    if (search_word.includes("台北")) {
        search_word = search_word.replace("台北", "臺北");
    }
    if (search_word.includes("台灣")) {
        search_word = search_word.replace("台灣", "臺灣");
    }
    search_word = replace_fullwidth_and_symbol(search_word);
    search_word = number_change_words(search_word);
    search_word = word_change_number(search_word);
    return search_word;
};

module.exports = {
    removeDuplicates,
    full_search
};
