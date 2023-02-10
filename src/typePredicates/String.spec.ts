import { expect } from "chai";
import { assertIsString } from "./String";

describe("String type assertion funtion", function (): void {
  describe("Valid String", function (): void {
    it("should not throw error", function (): void {
      expect(assertIsString("")).to.be.undefined;
    });
  });
  describe("Invalid Values", function (): void {
    describe("Empty Object", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString({})).to.throw(TypeError);
      });
    });
    describe("Object is number", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString(0)).to.throw(TypeError);
      });
    });
    describe("Object is null", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString(null)).to.throw(TypeError);
      });
    });
    describe("Object is boolean", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString(true)).to.throw(TypeError);
      });
    });
    describe("Object is array", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString([])).to.throw(TypeError);
      });
    });
    describe("Object is undefined", function (): void {
      it("should be false", function (): void {
        expect(() => assertIsString(undefined)).to.throw(TypeError);
      });
    });
  });
});
