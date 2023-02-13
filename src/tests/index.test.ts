import { runInThisContext } from "vm";
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

    let result = success.onSuccessAction((value) => {
      expect(value).toBe("OK");
      executed = true;
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(executed).toBe(true);
  });

  it("execute on success function", () => {
    let success = Result.ok("OK");

    let executed = false;

    let result = success.onSuccess((value) => {
      executed = true;
      expect(value).toBe("OK");
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

    let result = success.onFailure((error) => {
      expect(error).toBe("Failed");
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

    let result = success.onBothAction((result) => {
      expect(result.value).toBe("OK");
      executed++;
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(executed).toBe(1);

    result = failed.onBothAction((result) => {
      expect(result.error).toBe("Failed");
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

    let result = success.onBoth((result) => {
      expect(result.value).toBe("OK");
      executed++;
      return Result.ok("Whatever");
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(result.value).toBe("Whatever");
    expect(executed).toBe(1);

    result = failed.onBoth((result) => {
      expect(result.error).toBe("Failed");
      executed++;
      return Result.error("Whatever");
    });

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(result.error).toBe("Whatever");
    expect(executed).toBe(2);
  });

  it("chain success result with failed one", () => {
    let success = Result.ok("OK");

    let executed = 0;

    let result = success.onSuccess((value) => {
      executed++;
      expect(value).toBe("OK");
      return Result.error("Failed");
    })
    .onFailure(error => {
      executed++;
      expect(error).toBe("Failed");
    });

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(result.error).toBe("Failed");
    expect(executed).toBe(2);
  });

  it("execute async on success", async () => {
    let success = Result.ok("OK");

    let executed = false;

    async function runAsyncMethod(): Promise<void>{
      executed = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let result = await success.onSuccessAsync(async (value) => {
      await runAsyncMethod();
      expect(value).toBe("OK");
      return Result.ok(value);
    });

    expect(result.success).toBe(true);
    expect(result.failure).toBe(false);
    expect(result.value).toBe("OK");
    expect(executed).toBe(true);
  });

  it("chain async methods", async () => {
    let success = Result.ok("OK");
    let anotherSuccess = Result.ok("Fine");

    let executed = 0;

    async function runAsyncMethod(): Promise<Result<any>>{
      executed++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return anotherSuccess;
    }

    async function runAsyncMethodAction(): Promise<void>{
      executed++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let result = await success.onSuccess((value) => {
      executed++;
      expect(value).toBe("OK");
      return Result.ok(value);
    })
    .onSuccessAsync(async (value) => {
      expect(value).toBe("OK");
      return runAsyncMethod();
    })
    .then(r => r.onSuccessAsync(async value => {
      expect(value).toBe("Fine");
      return Result.error("Failed");
    }))
    .then(r => r.onFailureAsync(async error => {
      runAsyncMethodAction();
      expect(error).toBe("Failed");
    }));

    expect(result.success).toBe(false);
    expect(result.failure).toBe(true);
    expect(result.error).toBe("Failed");
    expect(executed).toBe(3);
  });
});