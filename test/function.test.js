/* eslint-disable camelcase */
const crawler = require("../crawler/crawler_function.js"); // crawler_function.js 檔

jest.setTimeout(10000);
test("test complete_the_address function", async () => {
    const correct_test_answer_1 = await crawler.complete_the_address("100台北市中正區忠孝東路一段1號");
    const correct_test_answer_2 = await crawler.complete_the_address("台北市中正區忠孝東路1段１號");
    const correct_test_answer_3 = await crawler.complete_the_address("忠孝東路1段１號");
    const correct_test_answer_4 = await crawler.complete_the_address(
        "100台北市中正區忠孝東路一段1號(行政院)"
    );
    const correct_test_answer_5 = await crawler.complete_the_address("台北市中正區  忠孝東路一段1號");
    const error_test_answer_1 = await crawler.complete_the_address("台北市中正區忠孝東路1段依號");
    const error_test_answer_2 = await crawler.complete_the_address("台北市我家巷口");

    expect(typeof correct_test_answer_1).toBe("string");
    expect(correct_test_answer_1).toBeDefined();
    expect(correct_test_answer_1).not.toBeNull();
    expect(correct_test_answer_1).toMatch("臺北市中正區忠孝東路一段1號");
    expect(correct_test_answer_2).toMatch("臺北市中正區忠孝東路一段1號");
    expect(correct_test_answer_3).toMatch("臺北市中正區忠孝東路一段1號");
    expect(correct_test_answer_4).toMatch("臺北市中正區忠孝東路一段1號");
    expect(correct_test_answer_5).toMatch("臺北市中正區忠孝東路一段1號");
    expect(error_test_answer_1).toMatch("error");
    expect(error_test_answer_2).toMatch("error");
});

test("test normal_request function", async () => {
    const correct_test_answer_1 = await crawler.normal_request(
        "https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H"
    );
    const error_test_answer_1 = await crawler.normal_request(
        "https://cloud.culture.tw/frontsite/trans/emapOpenDataAdfawection.do?method=exportEmapJson&typeId=H"
    );

    expect(typeof correct_test_answer_1).toBe("object");
    expect(correct_test_answer_1).toBeDefined();
    expect(correct_test_answer_1).not.toBeNull();
    expect(error_test_answer_1).toBe(404);
});

test("test replace_fullwidth_and_symbol function", () => {
    const correct_test_answer_1 = crawler.replace_fullwidth_and_symbol("１２３號");
    const correct_test_answer_2 = crawler.replace_fullwidth_and_symbol("123號");
    const correct_test_answer_3 = crawler.replace_fullwidth_and_symbol("123号");
    const correct_test_answer_4 = crawler.replace_fullwidth_and_symbol("1 2 3 號");
    const correct_test_answer_5 = crawler.replace_fullwidth_and_symbol("123號（左邊）");
    const correct_test_answer_6 = crawler.replace_fullwidth_and_symbol("123號[左邊]");
    const correct_test_answer_7 = crawler.replace_fullwidth_and_symbol("基隆路一段32號");

    expect(typeof correct_test_answer_1).toBe("string");
    expect(correct_test_answer_1).toBeDefined();
    expect(correct_test_answer_1).not.toBeNull();
    expect(correct_test_answer_1).toMatch("123號");
    expect(correct_test_answer_2).toMatch("123號");
    expect(correct_test_answer_3).toMatch("123號");
    expect(correct_test_answer_4).toMatch("123號");
    expect(correct_test_answer_5).toMatch("123號(左邊)");
    expect(correct_test_answer_6).toMatch("123號(左邊)");
    expect(correct_test_answer_7).toMatch("基隆路一段32號");
});
