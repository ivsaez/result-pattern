import { Result } from "../index";

describe("Result should", () => {
  it("create a success", () => {
    let success = Result.ok("OK");

    expect(success.success).toBe(true);
    expect(success.failure).toBe(false);
    expect(success.value).toBe("OK");
    expect(success.error).toBe("");
  });

  it("create an error", () => {
    let failure = Result.error("WRONG");

    expect(failure.success).toBe(false);
    expect(failure.failure).toBe(true);
    expect(failure.error).toBe("WRONG");
    expect(() => failure.value).toThrowError();
  });

  it("combine success", () => {
    let success = Result.ok("OK");
    let anotherSuccess = Result.ok("SUPER");

    let combined = Result.combine([ success, anotherSuccess ]);

    expect(combined.success).toBe(true);
    expect(combined.failure).toBe(false);
    expect(combined.value).toBe(undefined);
    expect(combined.error).toBe("");
  });

  it("combine all success", () => {
    let success = Result.ok("OK");
    let anotherSuccess = Result.ok("SUPER");

    let combined = Result.combineAll([ success, anotherSuccess ]);

    expect(combined.success).toBe(true);
    expect(combined.failure).toBe(false);
    expect(combined.value).toBe(undefined);
    expect(combined.error).toBe("");
  });

  it("combine error", () => {
    let failure = Result.error("WRONG");
    let anotherFailure = Result.error("WRONG AGAIN");

    let combined = Result.combine([ failure, anotherFailure ]);

    expect(combined.success).toBe(false);
    expect(combined.failure).toBe(true);
    expect(combined.error).toBe("WRONG");
    expect(() => failure.value).toThrowError();
  });

  it("combine all error", () => {
    let failure = Result.error("WRONG");
    let anotherFailure = Result.error("WRONG AGAIN");

    let combined = Result.combineAll([ failure, anotherFailure ]);

    expect(combined.success).toBe(false);
    expect(combined.failure).toBe(true);
    expect(combined.error).toBe("WRONG WRONG AGAIN");
    expect(() => failure.value).toThrowError();
  });
});