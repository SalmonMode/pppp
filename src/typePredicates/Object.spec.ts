import { expect } from "chai";
import { isObject } from "./Object";

describe("Object type predicate", function (): void {
  describe("Valid Object", function (): void {
    describe("Empty Object", function (): void {
      it("should be true", function (): void {
        expect(isObject({})).to.be.true;
      });
    });
    describe("Object With Content", function (): void {
      it("should be true", function (): void {
        expect(isObject({ a: "apple" })).to.be.true;
      });
    });
    describe("Array", function (): void {
      it("should be true", function (): void {
        expect(isObject([])).to.be.true;
      });
    });
  });
  describe("Invalid Object", function (): void {
    describe("String", function (): void {
      it("should be false", function (): void {
        expect(isObject("Hello")).to.be.false;
      });
    });
    describe("Empty String", function (): void {
      it("should be false", function (): void {
        expect(isObject("")).to.be.false;
      });
    });
    describe("Number", function (): void {
      it("should be false", function (): void {
        expect(isObject(3)).to.be.false;
      });
    });
    describe("Null", function (): void {
      it("should be false", function (): void {
        expect(isObject(null)).to.be.false;
      });
    });
    describe("Boolean", function (): void {
      it("should be false", function (): void {
        expect(isObject(true)).to.be.false;
      });
    });
    describe("Undefined", function (): void {
      it("should be false", function (): void {
        expect(isObject(undefined)).to.be.false;
      });
    });
  });
});
