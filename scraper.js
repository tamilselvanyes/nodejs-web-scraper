import axios from "axios";
import cheerio from "cheerio";

export const fetchfromAmazon = async (product) => {
  try {
    const response = await axios.get(`https://www.amazon.in/s?k=${product}`);

    const html = response.data;

    const $ = cheerio.load(html);

    const chairs = [];

    $(
      ".sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.sg-col-4-of-20"
    ).each((_idx, el) => {
      const chair = $(el);
      const title = chair
        .find(".a-size-base-plus.a-color-base.a-text-normal")
        .text();
      const image = chair.find(".s-image").attr("src");

      const reviews = chair
        .find(
          ".a-section.a-spacing-none.a-spacing-top-micro > div.a-row.a-size-small"
        )
        .children("span")
        .last()
        .attr("aria-label");

      const stars = chair
        .find(".a-section.a-spacing-none.a-spacing-top-micro > div > span")
        .attr("aria-label");

      const price = chair.find(".a-price > .a-offscreen").text();
      const discount_price = "₹" + price.split("₹")[1];
      const original_price = "₹" + price.split("₹")[2];
      const shop = "www.amazon.com";

      let element = {
        title,
        image,
        discount_price,
        original_price,
        shop,
      };

      if (reviews) {
        element.reviews = reviews;
      }

      if (stars) {
        element.stars = stars;
      }

      chairs.push(element);
    });

    return chairs;
  } catch (error) {
    throw error;
  }
};

export const fetchfromAmazonDifferentStructure = async (product) => {
  try {
    const response = await axios.get(`https://www.amazon.in/s?k=${product}`);

    const html = response.data;

    const $ = cheerio.load(html);

    const products = [];

    $(
      "div.s-result-item.s-asin.sg-col-0-of-12.sg-col-16-of-20.sg-col.s-widget-spacing-small.sg-col-12-of-16"
    ).each((_idx, el) => {
      const item = $(el);
      const title = item
        .find(".a-size-medium.a-color-base.a-text-normal")
        .text();
      const image = item.find(".s-image").attr("src");

      const reviews = item
        .find(
          ".a-section.a-spacing-none.a-spacing-top-micro > div.a-row.a-size-small"
        )
        .children("span")
        .last()
        .attr("aria-label");

      const stars = item.find(".a-icon-alt").text();

      const price = item.find(".a-offscreen").text();
      const discount_price = "₹" + price.split("₹")[1];
      const original_price = "₹" + price.split("₹")[2];
      const shop = "www.amazon.com";

      let element = {
        title,
        image,
        discount_price,
        original_price,
        shop,
      };

      if (reviews) {
        element.reviews = reviews;
      }

      if (stars) {
        element.stars = stars;
      }
      products.push(element);
    });

    return products;
  } catch (error) {
    throw error;
  }
};

export const fetchfromFlipkart = async (product) => {
  try {
    const response = await axios.get(
      `https://www.flipkart.com/search?q=${product}`
    );

    const html = response.data;

    const $ = cheerio.load(html);
    const result = [];

    $("._1AtVbE.col-12-12").each((index, ele) => {
      const phone = $(ele);
      const title = phone.find("._4rR01T").text();
      const image = phone.find("._396cs4._3exPp9").attr("src");
      const original_price = phone.find("._30jeq3._1_WHN1").text();
      const discount_price = "-";
      const stars = phone.find("._3LWZlK").text();
      const reviews = 246;
      const shop = "www.flipkart.com";

      let value = {
        title,
        image,
        discount_price,
        original_price,
        stars,
        reviews,
        shop,
      };
      if (value !== null && value.title !== undefined && value.title !== "") {
        result.push(value);
      }
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

export const fetchfromFlipkartDifferentStructure = async (product) => {
  try {
    const response = await axios.get(
      `https://www.flipkart.com/search?q=${product}`
    );

    const html = response.data;

    const $ = cheerio.load(html);
    const result = [];

    $("._4ddWXP").each((index, ele) => {
      const phone = $(ele);
      const title = phone.find(".s1Q9rs").text();
      const image = phone.find("._396cs4._3exPp9").attr("src");
      const original_price = phone.find("._30jeq3").text();
      const discount_price = "-";
      const stars = phone.find("._3I9_wc").text();
      const reviews = 246;
      const shop = "www.flipkart.com";

      let value = {
        title,
        image,
        discount_price,
        original_price,
        stars,
        reviews,
        shop,
      };
      if (value !== null && value.title !== undefined && value.title !== "") {
        result.push(value);
      }
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

export const fetchfromSnapdeal = async (product) => {
  try {
    const response = await axios.get(
      `https://www.snapdeal.com/search?keyword=${product}`
    );

    const html = response.data;

    const $ = cheerio.load(html);
    const result = [];

    $(".col-xs-6.product-tuple-listing.js-tuple").each((index, ele) => {
      const phone = $(ele);
      const title = phone.find(".product-title").text();
      const image = phone.find(".compareImg").attr("value");
      const original_price = phone
        .find(".lfloat.product-desc-price.strike")
        .text();
      const discount_price = phone.find(".lfloat.product-price").text();
      const stars = "-";
      const reviews = phone.find(".product-rating-count").text();
      const shop = "www.snapdeal.com";

      let value = {
        title,
        image,
        discount_price,
        original_price,
        stars,
        reviews,
        shop,
      };
      if (value !== null && value.title !== undefined && value.title !== "") {
        result.push(value);
      }
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};
