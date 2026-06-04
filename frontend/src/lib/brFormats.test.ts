import { describe, expect, it } from "vitest";
import { digitsOnly, formatCpfCnpj, formatPhoneBr, isValidCpfCnpjDigits, isValidPhoneDigits } from "./brFormats";

describe("formatCpfCnpj", () => {
  it("formats partial CPF", () => {
    expect(formatCpfCnpj("123")).toBe("123");
    expect(formatCpfCnpj("123456789")).toBe("123.456.789");
  });

  it("formats complete CPF", () => {
    expect(formatCpfCnpj("12345678909")).toBe("123.456.789-09");
  });

  it("switches to CNPJ mask at 12 digits", () => {
    expect(formatCpfCnpj("123456789012")).toBe("12.345.678/9012");
    expect(formatCpfCnpj("12345678000190")).toBe("12.345.678/0001-90");
  });

  it("strips non-digits on paste", () => {
    expect(formatCpfCnpj("123.456.789-09")).toBe("123.456.789-09");
    expect(formatCpfCnpj("12.345.678/0001-90")).toBe("12.345.678/0001-90");
  });
});

describe("formatPhoneBr", () => {
  it("formats landline", () => {
    expect(formatPhoneBr("1134567890")).toBe("(11) 3456-7890");
  });

  it("formats mobile", () => {
    expect(formatPhoneBr("11999998888")).toBe("(11) 99999-8888");
  });

  it("strips formatting on paste", () => {
    expect(formatPhoneBr("(11) 99999-8888")).toBe("(11) 99999-8888");
  });
});

describe("validation helpers", () => {
  it("validates CPF/CNPJ digit lengths", () => {
    expect(isValidCpfCnpjDigits("12345678909")).toBe(true);
    expect(isValidCpfCnpjDigits("12345678000190")).toBe(true);
    expect(isValidCpfCnpjDigits("1234567890")).toBe(false);
  });

  it("validates phone digit lengths", () => {
    expect(isValidPhoneDigits("1134567890")).toBe(true);
    expect(isValidPhoneDigits("11999998888")).toBe(true);
    expect(isValidPhoneDigits("1134567")).toBe(false);
  });

  it("digitsOnly removes non-digits", () => {
    expect(digitsOnly("12.345.678/0001-90")).toBe("12345678000190");
  });
});
