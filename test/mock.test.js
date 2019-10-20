/* eslint-disable camelcase */
const axios = require("axios");

const fb_sign_ig = async () => {
    const fb_url =
        "https://graph.facebook.com/v3.3/me?fields=email,name,picture.width(400).height(500)&access_token=TEST1213";
    const fb_response = await axios.get(fb_url);
    return fb_response.data;
};

jest.mock("axios");

test("test sigh in function", async () => {
    const data = { name: "danielXXX", email: "test123@test.com.tw" };
    // 為 axios 中的 get 模擬回傳值為 res
    const res = { data };
    axios.get.mockResolvedValue(res);

    return fb_sign_ig().then(response => {
        expect(typeof response).toBe("object");
        expect(response).toBeDefined();
        expect(response).toHaveProperty("name");
        expect(response).toHaveProperty("email");
        expect(response.name).toBeDefined();
        expect(typeof response.name).toBe("string");
        expect(response.email).toBeDefined();
        expect(typeof response.email).toBe("string");
        expect(response).not.toBeNull();
    });
});
