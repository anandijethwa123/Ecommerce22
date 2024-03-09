class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  async execute() {
    try {
      // Execute the query only once
      let result = this.query;

      // Search
      if (this.queryStr.keyword) {
        const keyword = {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        };
        result = result.find({ ...keyword });
      }

      // Filter
      const queryCopy = { ...this.queryStr };
      const removeFields = ["keyword", "page", "limit"];
      removeFields.forEach((key) => delete queryCopy[key]);
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
      result = result.find(JSON.parse(queryStr));

      // Pagination
      const resultPerPage = parseInt(this.queryStr.limit, 10) || 8;
      const currentPage = parseInt(this.queryStr.page, 10) || 1;
      const skip = resultPerPage * (currentPage - 1);
      result = result.limit(resultPerPage).skip(skip);

      // Execute the final query
      const data = await result;

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ApiFeatures;
