const crawler = require("./crawler/crawler_function.js");                             // crawler_function.js 檔
const dao_map = require("./dao/map.js"); // dao_map.js檔
const axios = require('axios');


jest.setTimeout(10000);
test('test complete_the_address function',async () => {
    let correct_test_answer_1 = await crawler.complete_the_address("100台北市中正區忠孝東路一段1號");
    let correct_test_answer_2 = await crawler.complete_the_address("台北市中正區忠孝東路1段１號");
    let correct_test_answer_3 = await crawler.complete_the_address("忠孝東路1段１號");
    let correct_test_answer_4 = await crawler.complete_the_address("100台北市中正區忠孝東路一段1號(行政院)");
    let correct_test_answer_5 = await crawler.complete_the_address("台北市中正區  忠孝東路一段1號");
    let error_test_answer_1 = await crawler.complete_the_address("台北市中正區忠孝東路1段依號");
    let error_test_answer_2 = await crawler.complete_the_address("台北市我家巷口");

    expect(typeof correct_test_answer_1).toBe('string');
    expect(correct_test_answer_1).toBeDefined();
    expect(correct_test_answer_1).not.toBeNull();
    expect(correct_test_answer_1).toMatch(/臺北市中正區忠孝東路一段1號/);
    expect(correct_test_answer_2).toMatch(/臺北市中正區忠孝東路一段1號/);
    expect(correct_test_answer_3).toMatch(/臺北市中正區忠孝東路一段1號/);
    expect(correct_test_answer_4).toMatch(/臺北市中正區忠孝東路一段1號/);
    expect(correct_test_answer_5).toMatch(/臺北市中正區忠孝東路一段1號/);
    expect(error_test_answer_1).toMatch(/error/);
    expect(error_test_answer_2).toMatch(/error/);
});



test('test normal_request function',async () => {
    let correct_test_answer_1 = await crawler.normal_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H");
    let error_test_answer_1 = await crawler.normal_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAdfawection.do?method=exportEmapJson&typeId=H");

    expect(typeof correct_test_answer_1).toBe('object');
    expect(correct_test_answer_1).toBeDefined();
    expect(correct_test_answer_1).not.toBeNull();
    expect(error_test_answer_1).toBe(404);

});


const fb_sign_ig = async () => {
    let fb_url ="https://graph.facebook.com/v3.3/me?fields=email,name,picture.width(400).height(500)&access_token=TEST1213";
    let fb_response = await axios.get(fb_url);
    return fb_response.data;
}

jest.mock('axios');

test('test sigh in function',async () => {
    const data = { name: "danielXXX", email: "test123@test.com.tw" };
    // 為 axios 中的 get 模擬回傳值為 res
    res = {data:data};
    axios.get.mockResolvedValue(res);

    return fb_sign_ig().then((response) => {
        console.log(response)
        expect(typeof response).toBe('object');
        expect(response).toBeDefined();
        expect(response.name).toBeDefined();
        expect(typeof response.name).toBe('string');
        expect(response.email).toBeDefined();
        expect(typeof response.email).toBe('string');
        expect(response).not.toBeNull();

    })
});


