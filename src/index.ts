export class Result<T> {
  private _success: boolean;
  private _error: string;
  private _value: T;

  private constructor (success: boolean, error?: string, value?: T) {
    if (success && error)
      throw new Error("Successful doesn't need error message.");

    if (!success && !error)
      throw new Error("Failure result needs error message.");

    this._success = success;
    this._error = error;
    this._value = value;
  }

  get success(){
    return this._success;
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

  public static ok<T>(value?: T) : Result<T> {
    return new Result<T>(true, null, value);
  }

  public static error<T>(error: string): Result<T> {
    return new Result<T>(false, error);
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
}