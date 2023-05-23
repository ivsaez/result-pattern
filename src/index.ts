export const NeutralCode = 0;

export class Result<T> {
  private _success: boolean;
  private _code: number;
  private _error: string;
  private _value: T;

  private constructor (success: boolean, code: number, error?: string, value?: T) {
    if (success && error)
      throw new Error("Successful doesn't need error message.");

    if (!success && !error)
      throw new Error("Failure result needs error message.");

    if(code < 0)
      throw new Error("Code must be greater than 0.");

    this._success = success;
    this._code = code;
    this._error = error;
    this._value = value;
  }

  get success(){
    return this._success;
  }

  get code(){
    return this._code;
  }

  get failure(){
    return !this._success;
  }

  get error(){
    if(this._error == null) 
      return "";
    
    return this._error;
  }

  get value(){
    if (!this._success)
      throw new Error('The result is a failure.');

    return this._value;
  }

  get isNeutralCode(): boolean{
    return this._code == NeutralCode;
  }

  public static ok<T>(value?: T) : Result<T> {
    return new Result<T>(true, NeutralCode, null, value);
  }

  public static error<T>(error: string, code: number = NeutralCode): Result<T> {
    return new Result<T>(false, code, error);
  }

  public static combine(results: Result<any>[]) : Result<any> {
    for (let result of results)
      if (result.failure) 
        return result;
    
    return Result.ok<any>();
  }

  public static combineAll(results: Result<any>[]) : Result<any> {
    let messages: string[] = [];
    
    for (let result of results)
      if (result.failure) 
        messages.push(result.error);
    
    if(messages.length > 0)
      return Result.error<any>(messages.join(' '));
    
    return Result.ok<any>();
  }

  public onSuccessAction(action: (result: T) => void) : Result<any>
  {
      if (this.failure)
          return this;

      action(this.value);

      return Result.ok<T>(this.value);
  }

  public async onSuccessActionAsync(action: (result: T) => Promise<void>) : Promise<Result<any>>
  {
      if (this.failure)
          return this;

      await action(this.value);

      return Result.ok<T>(this.value);
  }

  public onSuccess(func: (result: T) => Result<any>) : Result<any>
  {
      if (this.failure)
          return this;
      
      return func(this.value);
  }

  public async onSuccessAsync(func: (result: T) => Promise<Result<any>>) : Promise<Result<any>>
  {
      if (this.failure)
          return this;
      
      return await func(this.value);
  }

  public onFailure(action: (error: string) => void) : Result<any>
  {
      if (this.failure)
      {
          action(this.error);
      }

      return this;
  }

  public async onFailureAsync(action: (error: string) => Promise<void>) : Promise<Result<any>>
  {
      if (this.failure)
      {
          await action(this.error);
      }

      return this;
  }

  public onBothAction(action: (result: Result<any>) => void) : Result<any>
  {
      action(this);

      return this;
  }

  public async onBothActionAsync(action: (result: Result<any>) => Promise<void>) : Promise<Result<any>>
  {
      await action(this);

      return this;
  }

  public onBoth<T>(func: (result: Result<any>) => T) : T
  {
      return func(this);
  }

  public async onBothAsync<T>(func: (result: Result<any>) => Promise<T>) : Promise<T>
  {
      return await func(this);
  }
}