import * as chai from "chai";
import { assertIsNumber } from "./Number";

var expect = chai.expect;

describe("Number type assertion funtion", function () {
  describe("Valid Number", function () {
    it("should not throw error", function () {
      expect(assertIsNumber(0)).to.be.undefined;
    });
  });
  describe("Invalid Values", function () {
    describe("Empty Object", function () {
      it("should be false", function () {
        expect(() => assertIsNumber({})).to.throw(TypeError);
      });
    });
    describe("Object is string", function () {
      it("should be false", function () {
        expect(() => assertIsNumber("")).to.throw(TypeError);
      });
    });
    describe("Object is null", function () {
      it("should be false", function () {
        expect(() => assertIsNumber(null)).to.throw(TypeError);
      });
    });
    describe("Object is boolean", function () {
      it("should be false", function () {
        expect(() => assertIsNumber(true)).to.throw(TypeError);
      });
    });
    describe("Object is array", function () {
      it("should be false", function () {
        expect(() => assertIsNumber([])).to.throw(TypeError);
      });
    });
    describe("Object is undefined", function () {
      it("should be false", function () {
        expect(() => assertIsNumber(undefined)).to.throw(TypeError);
      });
    });
  });
});
