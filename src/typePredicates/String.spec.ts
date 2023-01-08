import * as chai from "chai";
import { assertIsString } from "./String";

var expect = chai.expect;

describe("String type assertion funtion", function () {
  describe("Valid String", function () {
    it("should not throw error", function () {
      expect(assertIsString("")).to.be.undefined;
    });
  });
  describe("Invalid Values", function () {
    describe("Empty Object", function () {
      it("should be false", function () {
        expect(() => assertIsString({})).to.throw(TypeError);
      });
    });
    describe("Object is number", function () {
      it("should be false", function () {
        expect(() => assertIsString(0)).to.throw(TypeError);
      });
    });
    describe("Object is null", function () {
      it("should be false", function () {
        expect(() => assertIsString(null)).to.throw(TypeError);
      });
    });
    describe("Object is boolean", function () {
      it("should be false", function () {
        expect(() => assertIsString(true)).to.throw(TypeError);
      });
    });
    describe("Object is array", function () {
      it("should be false", function () {
        expect(() => assertIsString([])).to.throw(TypeError);
      });
    });
    describe("Object is undefined", function () {
      it("should be false", function () {
        expect(() => assertIsString(undefined)).to.throw(TypeError);
      });
    });
  });
});
