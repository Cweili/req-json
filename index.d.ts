declare namespace ReqJSON {
  interface HTTPMethod {
    /**
     * Send HTTP request.
     *
     * @param data The data to be sent.
     * @param options The options to use for each requests to the resource.
     */
    (data?: any, options?: object): Promise<string | object>
  }

  interface ShortHandMethod {
    /**
     * Send HTTP request.
     *
     * @param path The path to use for the request, with parameters defined.
     * @param data The data to be sent.
     * @param options The options to use for each requests to the resource.
     */
    (path?: string, data?: any, options?: object): Promise<string | object>
  }

  interface RESTfulMethods {
    get: HTTPMethod
    post: HTTPMethod
    put: HTTPMethod
    delete: HTTPMethod
  }

  /**
   * ReqJSON request context
   */
  interface Context {
    /**
     * The path to use for the request, with parameters defined.
     */
    path: string

    /**
     * The HTTP method to use for the request (e.g. "POST", "GET", "PUT", "DELETE").
     */
    method: string

    /**
     * The URL to which the request is sent.
     */
    url: string

    /**
     * The data to be sent.
     */
    data: any

    /**
     * The options to use for the request.
     */
    options: object

    /**
     * The HTTP status of the response. Only available when the request completes.
     */
    status?: number

    /**
     * The parsed response. Only available when the request completes.
     */
    response?: string | object

    /**
     * The request headers before the request is sent, the response headers when the request completes.
     */
    headers: object

    /**
     * Alias to `headers`
     */
    header: object

    /**
     * The original XMLHttpRequest object.
     */
    xhr: XMLHttpRequest
  }

  interface Middleware extends Function {
    /**
     * ReqJSON middleware, similar to Koa.js middleware.
     * 
     * @param context ReqJSON request context
     * @param next ReqJSON Middleware
     */
    (context?: Context, next?: Middleware): any
  }
}

declare class ReqJSON {
  /**
   * Create a new ReqJSON instance
   */
  constructor();

  /**
   * Define a RESTful resource.
   * 
   * @param path The path to use for the request, with parameters defined.
   * @param options The options to use for each requests to the resource.
   */
  resource(
    path: string,
    options: object
  ): ReqJSON.RESTfulMethods

  /**
   * Register a ReqJSON middleware
   * 
   * @param middleware A ReqJSON middleware
   */
  use(middleware: ReqJSON.Middleware): this

  get: ReqJSON.ShortHandMethod
  post: ReqJSON.ShortHandMethod
  put: ReqJSON.ShortHandMethod
  delete: ReqJSON.ShortHandMethod
}

export = ReqJSON