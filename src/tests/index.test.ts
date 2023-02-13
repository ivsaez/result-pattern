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

  it("execute on success action", () => {
    let success = Result.ok("OK");

    let executed = false;

    let result = success.onSuccessAction(() => {
      executed = true;
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(executed).toBe(true);
  });

  it("execute on success function", () => {
    let success = Result.ok("OK");

    let executed = false;

    let result = success.onSuccess(() => {
      executed = true;
      return Result.ok("Whatever");
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(result.value).toBe("Whatever");
    expect(executed).toBe(true);
  });

  it("execute on failed action", () => {
    let success = Result.error("Failed");

    let executed = false;

    let result = success.onFailure(() => {
      executed = true;
    });

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(result.error).toBe("Failed");
    expect(executed).toBe(true);
  });

  it("execute on both action", () => {
    let success = Result.ok("OK");
    let failed = Result.error("Failed");

    let executed = 0;

    let result = success.onBothAction(() => {
      executed++;
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(executed).toBe(1);

    result = failed.onBothAction(() => {
      executed++;
    });

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(executed).toBe(2);
  });

  it("execute on both function", () => {
    let success = Result.ok("OK");
    let failed = Result.error("Failed");

    let executed = 0;

    let result = success.onBoth(() => {
      executed++;
      return Result.ok("Whatever");
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(result.value).toBe("Whatever");
    expect(executed).toBe(1);

    result = failed.onBoth(() => {
      executed++;
      return Result.error("Whatever");
    });

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(result.error).toBe("Whatever");
    expect(executed).toBe(2);
  });
});