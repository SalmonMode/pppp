import { expect } from "chai";
import { assertIsNumber } from "./Number";

describe("Number type assertion funtion", function (): void {
  describe("Valid Number", function (): void {
    it("should not throw error", function (): void {
      expect(assertIsNumber(0)).to.be.undefined;
    });
  });
  describe("Invalid Values", function (): void {
    describe("Empty Object", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber({})).to.throw(TypeError);
      });
    });
    describe("Object is string", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber("")).to.throw(TypeError);
      });
    });
    describe("Object is null", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber(null)).to.throw(TypeError);
      });
    });
    describe("Object is boolean", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber(true)).to.throw(TypeError);
      });
    });
    describe("Object is array", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber([])).to.throw(TypeError);
      });
    });
    describe("Object is undefined", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsNumber(undefined)).to.throw(TypeError);
      });
    });
  });
});
