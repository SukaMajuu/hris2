/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Represents a user account in the system. */
export interface User {
  /**
   * Unique identifier for the user.
   * @format uint
   * @example 1
   */
  id: number;
  /**
   * User's unique email address. Required for login.
   * @format email
   * @maxLength 255
   * @example "john.doe@example.com"
   */
  email: string;
  /**
   * User's unique phone number (optional).
   * @maxLength 20
   * @example "+6281234567890"
   */
  phone?: string | null;
  /**
   * Role assigned to the user, determining their permissions.
   * @example "user"
   */
  role: "admin" | "user" | "manager" | "hr";
  /**
   * Timestamp of the user's last login (optional).
   * @format date-time
   * @example "2024-07-15T10:00:00Z"
   */
  last_login_at?: string | null;
  /**
   * Timestamp when the user account was created.
   * @format date-time
   */
  created_at: string;
  /**
   * Timestamp when the user account was last updated.
   * @format date-time
   */
  updated_at: string;
}

export interface Employee {
  /**
   * Unique identifier for the employee.
   * @format uint
   */
  id: number;
  /**
   * Foreign key referencing the associated User ID.
   * @format uint
   */
  user_id: number;
  /**
   * Employee's first name.
   * @maxLength 255
   */
  first_name: string;
  /**
   * Employee's last name.
   * @maxLength 255
   */
  last_name: string;
  /**
   * Foreign key referencing the Position ID.
   * @format uint
   */
  position_id: number;
  /**
   * Indicates if the employee is currently active. True for active, False for inactive.
   * @default true
   */
  employment_status: boolean;
  /**
   * Unique code assigned to the employee (optional).
   * @maxLength 255
   */
  employee_code?: string | null;
  /**
   * Foreign key referencing the Branch ID (optional).
   * @format uint
   */
  branch_id?: number | null;
  /** Employee's gender (optional). */
  gender?: "male" | "female" | "other" | null;
  /**
   * Employee's phone number (optional).
   * @maxLength 255
   */
  phone?: string | null;
  /**
   * Employee's National Identity Number (KTP number in Indonesia) (optional).
   * @maxLength 255
   */
  nik?: string | null;
  /**
   * Place where the employee was born (optional).
   * @maxLength 255
   */
  place_of_birth?: string | null;
  /** Employee's highest level of education completed (optional). */
  last_education?:
    | "high_school"
    | "diploma"
    | "bachelor"
    | "master"
    | "doctorate"
    | null;
  /**
   * Employee's job grade or level (optional).
   * @maxLength 50
   */
  grade?: string | null;
  /** Type of employment contract (optional). */
  contract_type?: "permanent" | "contract" | "internship" | "freelance" | null;
  /**
   * Date the employee resigned (optional).
   * @format date
   */
  resignation_date?: string | null;
  /**
   * Date the employee was hired (optional).
   * @format date
   */
  hire_date?: string | null;
  /**
   * Name of the employee's bank (optional).
   * @maxLength 100
   */
  bank_name?: string | null;
  /**
   * Employee's bank account number (optional).
   * @maxLength 100
   */
  bank_account_number?: string | null;
  /**
   * Name on the employee's bank account (optional).
   * @maxLength 255
   */
  bank_account_holder_name?: string | null;
  /** Employee's tax status (e.g., PTKP status in Indonesia) (optional). */
  tax_status?:
    | "tk0"
    | "tk1"
    | "tk2"
    | "tk3"
    | "k0"
    | "k1"
    | "k2"
    | "k3"
    | "ki0"
    | "ki1"
    | "ki2"
    | "ki3"
    | null;
  /**
   * URL to the employee's profile photo (optional).
   * @format url
   * @maxLength 255
   */
  profile_photo_url?: string | null;
  /**
   * Timestamp when the record was created.
   * @format date-time
   */
  created_at: string;
  /**
   * Timestamp when the record was last updated.
   * @format date-time
   */
  updated_at: string;
}

/** Represents a job position within the organization. */
export interface Position {
  /**
   * Unique identifier for the position.
   * @format uint
   */
  id: number;
  /**
   * The name of the position.
   * @maxLength 255
   */
  name: string;
  /**
   * Timestamp when the position was created.
   * @format date-time
   */
  created_at: string;
  /**
   * Timestamp when the position was last updated.
   * @format date-time
   */
  updated_at: string;
}

/** Represents a company branch or location. */
export interface Branch {
  /**
   * Unique identifier for the branch.
   * @format uint
   */
  id: number;
  /**
   * The unique name of the branch.
   * @maxLength 255
   */
  name: string;
  /**
   * Timestamp when the branch was created.
   * @format date-time
   */
  created_at: string;
  /**
   * Timestamp when the branch was last updated.
   * @format date-time
   */
  updated_at: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title HRIS API
 * @version 1.0.0
 * @baseUrl http://localhost:8080/v1
 * @contact SukaMaju
 *
 * API documentation for Human Resource Information System
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Authentication
     * @name LoginCreate
     * @summary User login
     * @request POST:/auth/login
     */
    loginCreate: (
      data: {
        /**
         * User's email address, phone number, or employee code
         * @example "john.doe@example.com | +1234567890 | E12345"
         */
        identifier: string;
        /**
         * @format password
         * @example "securepassword123"
         */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Login successful" */
          message?: string;
          data?: {
            /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
            access_token?: string;
            /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
            refresh_token?: string;
            user?: {
              /** @example 1 */
              id?: number;
              /** @example "john.doe@example.com" */
              email?: string;
              /** @example "employee" */
              role?: string;
            };
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Invalid request" */
            message?: string;
            /** @example "Email and password are required" */
            error?: string;
          }
        | {
            /** @example 401 */
            status?: number;
            /** @example "Unauthorized" */
            message?: string;
            /** @example "Invalid email or password" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to process login request" */
            error?: string;
          }
      >({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user account
     *
     * @tags Authentication
     * @name RegisterCreate
     * @summary User registration
     * @request POST:/auth/register
     * @secure
     */
    registerCreate: (
      data: {
        /** @example "John" */
        first_name: string;
        /** @example "Doe" */
        last_name?: string;
        /**
         * @format email
         * @example "john.doe@example.com"
         */
        email: string;
        /**
         * @format password
         * @example "securepassword123"
         */
        password: string;
        /** @example true */
        agree_terms?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          /** @example "User registered successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            user_id?: number;
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Invalid request" */
            message?: string;
            /** @example "Email already in use" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to create user" */
            error?: string;
          }
      >({
        path: `/auth/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Log out the currently authenticated user by invalidating the access token.
     *
     * @tags Authentication
     * @name LogoutCreate
     * @summary User logout
     * @request POST:/auth/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Successfully logged out" */
          message?: string;
        },
        | {
            /** @example 401 */
            status?: number;
            /** @example "Unauthorized" */
            message?: string;
            /** @example "Token is missing or invalid" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to process logout request" */
            error?: string;
          }
      >({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Authenticates a user using a Google ID Token. If the user doesn't exist, attempts registration (requires agreeing to terms if applicable).
     *
     * @tags Authentication
     * @name GoogleCreate
     * @summary Google Sign-In / Registration
     * @request POST:/auth/google
     * @secure
     */
    googleCreate: (
      data: {
        /**
         * The Google ID Token received from the client-side Google Sign-In flow.
         * @example "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
         */
        token: string;
        /**
         * Required if the Google user is not yet registered and needs to agree to terms.
         * @default true
         * @example true
         */
        agree_terms?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Google login successful" */
          message?: string;
          data?: {
            /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
            token?: string;
            /** Represents a user account in the system. */
            user?: User;
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Bad Request" */
            message?: string;
          }
        | {
            /** @example 401 */
            status?: number;
            /** @example "Unauthorized" */
            message?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal Server Error" */
            message?: string;
          }
      >({
        path: `/auth/google`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Allows an authenticated user to change their password.
     *
     * @tags Authentication
     * @name PasswordChangeCreate
     * @summary Change Password
     * @request POST:/auth/password/change
     * @secure
     */
    passwordChangeCreate: (
      data: {
        /**
         * @format password
         * @example "oldpassword123"
         */
        old_password: string;
        /**
         * @format password
         * @example "newpassword123"
         */
        new_password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Password changed successfully" */
          message?: string;
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Bad Request" */
            message?: string;
          }
        | {
            /** @example 401 */
            status?: number;
            /** @example "Unauthorized" */
            message?: string;
          }
        | void
      >({
        path: `/auth/password/change`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Initiates the password reset process for a given email address. A reset link/code will typically be sent to the user's email.
     *
     * @tags Authentication
     * @name PasswordResetCreate
     * @summary Request Password Reset
     * @request POST:/auth/password/reset
     * @secure
     */
    passwordResetCreate: (
      data: {
        /**
         * @format email
         * @example "john.doe@example.com"
         */
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "If an account with that email exists, a password reset link has been sent." */
          message?: string;
          data?: any;
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Bad Request" */
            message?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal Server Error" */
            message?: string;
          }
      >({
        path: `/auth/password/reset`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  employees = {
    /**
     * No description
     *
     * @tags Employees
     * @name EmployeesList
     * @summary Get all employees
     * @request GET:/employees
     * @secure
     */
    employeesList: (
      query?: {
        department_id?: number;
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Employees retrieved successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example 1 */
            user_id?: number;
            /** @example "EMP001" */
            employee_code?: string;
            /** @example "John" */
            first_name?: string;
            /** @example "Doe" */
            last_name?: string;
            /** @example "+6281234567890" */
            phone?: string;
            /** @example 1 */
            department_id?: number;
            /** @example 1 */
            position_id?: number;
            /** @example "active" */
            employment_status?: "active" | "inactive";
            /**
             * @format date
             * @example "2023-01-01"
             */
            hire_date?: string;
          }[];
        },
        {
          /** @example 500 */
          status?: number;
          /** @example "Internal server error" */
          message?: string;
          /** @example "Failed to retrieve employees" */
          error?: string;
        }
      >({
        path: `/employees`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name EmployeesCreate
     * @summary Create new employee
     * @request POST:/employees
     * @secure
     */
    employeesCreate: (
      data: {
        /** @example "John" */
        first_name: string;
        /** @example "Doe" */
        last_name: string;
        /** @example "+6281234567890" */
        phone?: string;
        /** @example 1 */
        department_id: number;
        /** @example 1 */
        position_id: number;
        /** @example "active" */
        employment_status?: "active" | "inactive";
        /**
         * @format date
         * @example "2023-01-01"
         */
        hire_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          /** @example "Employee created successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example "EMP001" */
            employee_code?: string;
            /** @example "John" */
            first_name?: string;
            /** @example "Doe" */
            last_name?: string;
            /** @example "+6281234567890" */
            phone?: string;
            /** @example 1 */
            department_id?: number;
            /** @example 1 */
            position_id?: number;
            /** @example "active" */
            employment_status?: string;
            /**
             * @format date
             * @example "2023-01-01"
             */
            hire_date?: string;
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Invalid request" */
            message?: string;
            /** @example "Missing required fields" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to create employee" */
            error?: string;
          }
      >({
        path: `/employees`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name EmployeesDetail
     * @summary Get employee by ID
     * @request GET:/employees/{id}
     * @secure
     */
    employeesDetail: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Employee retrieved successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example "EMP001" */
            employee_code?: string;
            /** @example "John" */
            first_name?: string;
            /** @example "Doe" */
            last_name?: string;
            /** @example "+6281234567890" */
            phone?: string;
            /** @example 1 */
            department_id?: number;
            /** @example 1 */
            position_id?: number;
            /** @example "active" */
            employment_status?: string;
            /**
             * @format date
             * @example "2023-01-01"
             */
            hire_date?: string;
          };
        },
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Employee not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to retrieve employee" */
            error?: string;
          }
      >({
        path: `/employees/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name EmployeesPartialUpdate
     * @summary Update employee details
     * @request PATCH:/employees/{id}
     * @secure
     */
    employeesPartialUpdate: (
      id: number,
      data: {
        /** @example "John" */
        first_name?: string;
        /** @example "Doe" */
        last_name?: string;
        /** @example "+6281234567890" */
        phone?: string;
        /** @example 1 */
        department_id?: number;
        /** @example 1 */
        position_id?: number;
        /** @example "active" */
        employment_status?: "active" | "inactive";
        /**
         * @format date
         * @example "2023-01-01"
         */
        hire_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Employee updated successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example "EMP001" */
            employee_code?: string;
            /** @example "John" */
            first_name?: string;
            /** @example "Doe" */
            last_name?: string;
            /** @example "+6281234567890" */
            phone?: string;
            /** @example 1 */
            department_id?: number;
            /** @example 1 */
            position_id?: number;
            /** @example "active" */
            employment_status?: string;
            /**
             * @format date
             * @example "2023-01-01"
             */
            hire_date?: string;
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Invalid request" */
            message?: string;
            /** @example "Invalid data provided" */
            error?: string;
          }
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Employee not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to update employee" */
            error?: string;
          }
      >({
        path: `/employees/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update employee's employment status to inactive and set resignation date to current date
     *
     * @tags Employees
     * @name StatusPartialUpdate
     * @summary Update employee employment status
     * @request PATCH:/employees/{id}/status
     * @secure
     */
    statusPartialUpdate: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Employee status updated successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example "EMP001" */
            employee_code?: string;
            /** @example "John" */
            first_name?: string;
            /** @example "Doe" */
            last_name?: string;
            /** @example "inactive" */
            employment_status?: string;
            /**
             * @format date
             * @example "2024-03-15"
             */
            resignation_date?: string;
          };
        },
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Employee not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to update employee status" */
            error?: string;
          }
      >({
        path: `/employees/${id}/status`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  employeeDocuments = {
    /**
     * No description
     *
     * @tags Employee Documents
     * @name EmployeeDocumentsCreate
     * @summary Upload a new employee document
     * @request POST:/employee-documents
     * @secure
     */
    employeeDocumentsCreate: (
      data: {
        /** @example 1 */
        employee_id: number;
        /** @example "Employment Contract" */
        title: string;
        /** @example "https://storage.example.com/documents/contract.pdf" */
        document_url: string;
        /** @example "draft" */
        status?: "draft" | "active";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          status?: number;
          /** @example "Document uploaded successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example 1 */
            employee_id?: number;
            /** @example "Employment Contract" */
            title?: string;
            /** @example "https://storage.example.com/documents/contract.pdf" */
            document_url?: string;
            /**
             * @format date-time
             * @example "2024-03-15T10:30:00Z"
             */
            created_at?: string;
          };
        },
        | {
            /** @example 400 */
            status?: number;
            /** @example "Invalid request" */
            message?: string;
            /** @example "Missing required fields" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to upload document" */
            error?: string;
          }
      >({
        path: `/employee-documents`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employee Documents
     * @name EmployeeDocumentsList
     * @summary Get all employee documents
     * @request GET:/employee-documents
     * @secure
     */
    employeeDocumentsList: (
      query?: {
        employee_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Documents retrieved successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example 1 */
            employee_id?: number;
            /** @example "Employment Contract" */
            title?: string;
            /** @example "https://storage.example.com/documents/contract.pdf" */
            document_url?: string;
            /**
             * @format date-time
             * @example "2024-03-15T10:30:00Z"
             */
            created_at?: string;
          }[];
        },
        {
          /** @example 500 */
          status?: number;
          /** @example "Internal server error" */
          message?: string;
          /** @example "Failed to retrieve documents" */
          error?: string;
        }
      >({
        path: `/employee-documents`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employee Documents
     * @name EmployeeDocumentsDetail
     * @summary Get a specific employee document by ID
     * @request GET:/employee-documents/{id}
     * @secure
     */
    employeeDocumentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Document retrieved successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example 1 */
            employee_id?: number;
            /** @example "Employment Contract" */
            title?: string;
            /** @example "https://storage.example.com/documents/contract.pdf" */
            document_url?: string;
            /**
             * @format date-time
             * @example "2024-03-15T10:30:00Z"
             */
            created_at?: string;
          };
        },
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Document not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to retrieve document" */
            error?: string;
          }
      >({
        path: `/employee-documents/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update document title or URL
     *
     * @tags Employee Documents
     * @name EmployeeDocumentsPartialUpdate
     * @summary Update document details
     * @request PATCH:/employee-documents/{id}
     * @secure
     */
    employeeDocumentsPartialUpdate: (
      id: number,
      data: {
        /** @example "Updated Contract" */
        title?: string;
        /** @example "https://storage.example.com/documents/contract_v2.pdf" */
        document_url?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Document updated successfully" */
          message?: string;
          data?: {
            /** @example 1 */
            id?: number;
            /** @example 1 */
            employee_id?: number;
            /** @example "Updated Contract" */
            title?: string;
            /** @example "https://storage.example.com/documents/contract_v2.pdf" */
            document_url?: string;
            /**
             * @format date-time
             * @example "2024-03-15T10:30:00Z"
             */
            created_at?: string;
          };
        },
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Document not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to update document" */
            error?: string;
          }
      >({
        path: `/employee-documents/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Permanently delete a document
     *
     * @tags Employee Documents
     * @name EmployeeDocumentsDelete
     * @summary Delete document
     * @request DELETE:/employee-documents/{id}
     * @secure
     */
    employeeDocumentsDelete: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          status?: number;
          /** @example "Document deleted successfully" */
          message?: string;
        },
        | {
            /** @example 404 */
            status?: number;
            /** @example "Not found" */
            message?: string;
            /** @example "Document not found" */
            error?: string;
          }
        | {
            /** @example 500 */
            status?: number;
            /** @example "Internal server error" */
            message?: string;
            /** @example "Failed to delete document" */
            error?: string;
          }
      >({
        path: `/employee-documents/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  attendance = {
    /**
     * No description
     *
     * @tags Attendance
     * @name CheckInCreate
     * @summary Employee check-in
     * @request POST:/attendance/check-in
     * @secure
     */
    checkInCreate: (
      data: {
        /** @example 1 */
        employee_id?: number;
        /** @example 1 */
        work_arrangement_id?: number;
        ip_address?: string;
        notes?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          event_type?: "check_in";
        },
        void
      >({
        path: `/attendance/check-in`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Attendance
     * @name CheckOutCreate
     * @summary Employee check-out
     * @request POST:/attendance/check-out
     * @secure
     */
    checkOutCreate: (
      data: {
        /** @example 1 */
        employee_id?: number;
        /** @example 1 */
        work_arrangement_id?: number;
        ip_address?: string;
        notes?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          event_type?: "check_out";
        },
        void
      >({
        path: `/attendance/check-out`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Attendance
     * @name LogsList
     * @summary Get attendance logs
     * @request GET:/attendance/logs
     * @secure
     */
    logsList: (
      query?: {
        /** @format date */
        start_date?: string;
        /** @format date */
        end_date?: string;
        employee_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<any[], any>({
        path: `/attendance/logs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  dailyAttendance = {
    /**
     * No description
     *
     * @tags Daily Attendance
     * @name DailyAttendanceList
     * @summary Get daily attendance records
     * @request GET:/daily-attendance
     * @secure
     */
    dailyAttendanceList: (
      query?: {
        /** @format date */
        start_date?: string;
        /** @format date */
        end_date?: string;
        employee_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<any[], any>({
        path: `/daily-attendance`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Daily Attendance
     * @name DailyAttendanceDetail
     * @summary Get daily attendance by ID
     * @request GET:/daily-attendance/{id}
     * @secure
     */
    dailyAttendanceDetail: (id: number, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/daily-attendance/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  overtime = {
    /**
     * No description
     *
     * @tags Overtime
     * @name OvertimeCreate
     * @summary Submit overtime request
     * @request POST:/overtime
     * @secure
     */
    overtimeCreate: (data: any, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/overtime`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Overtime
     * @name OvertimeList
     * @summary Get overtime requests
     * @request GET:/overtime
     * @secure
     */
    overtimeList: (
      query?: {
        status?: "pending" | "approved" | "rejected";
        employee_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<any[], any>({
        path: `/overtime`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Overtime
     * @name ApproveCreate
     * @summary Approve/reject overtime request
     * @request POST:/overtime/{id}/approve
     * @secure
     */
    approveCreate: (
      id: number,
      data: {
        status?: "approved" | "rejected";
        notes?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/overtime/${id}/approve`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  departments = {
    /**
     * No description
     *
     * @tags Departments
     * @name DepartmentsList
     * @summary Get all departments
     * @request GET:/departments
     * @secure
     */
    departmentsList: (params: RequestParams = {}) =>
      this.request<any[], any>({
        path: `/departments`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Departments
     * @name DepartmentsCreate
     * @summary Create a new department
     * @request POST:/departments
     * @secure
     */
    departmentsCreate: (
      data: {
        name?: string;
        description?: string;
        active?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/departments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Departments
     * @name DepartmentsDetail
     * @summary Get department by ID
     * @request GET:/departments/{id}
     * @secure
     */
    departmentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/departments/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Departments
     * @name DepartmentsUpdate
     * @summary Update department by ID
     * @request PUT:/departments/{id}
     * @secure
     */
    departmentsUpdate: (
      id: number,
      data: {
        name?: string;
        description?: string;
        active?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void>({
        path: `/departments/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Departments
     * @name DepartmentsDelete
     * @summary Delete department by ID
     * @request DELETE:/departments/{id}
     * @secure
     */
    departmentsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/departments/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  positions = {
    /**
     * No description
     *
     * @tags Positions
     * @name PositionsList
     * @summary Get all positions
     * @request GET:/positions
     * @secure
     */
    positionsList: (params: RequestParams = {}) =>
      this.request<Position[], any>({
        path: `/positions`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Positions
     * @name PositionsCreate
     * @summary Create a new position
     * @request POST:/positions
     * @secure
     */
    positionsCreate: (
      data: {
        name?: string;
        department_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Position, any>({
        path: `/positions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Positions
     * @name PositionsDetail
     * @summary Get a position by ID
     * @request GET:/positions/{id}
     * @secure
     */
    positionsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Position, void>({
        path: `/positions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Positions
     * @name PositionsUpdate
     * @summary Update a position by ID
     * @request PUT:/positions/{id}
     * @secure
     */
    positionsUpdate: (
      id: number,
      data: {
        name?: string;
        department_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Position, void>({
        path: `/positions/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Positions
     * @name PositionsDelete
     * @summary Delete a position by ID
     * @request DELETE:/positions/{id}
     * @secure
     */
    positionsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/positions/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  workArrangements = {
    /**
     * No description
     *
     * @tags Work Arrangements
     * @name WorkArrangementsList
     * @summary Get all work arrangements
     * @request GET:/work-arrangements
     * @secure
     */
    workArrangementsList: (params: RequestParams = {}) =>
      this.request<any[], any>({
        path: `/work-arrangements`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Work Arrangements
     * @name WorkArrangementsCreate
     * @summary Create a new work arrangement
     * @request POST:/work-arrangements
     * @secure
     */
    workArrangementsCreate: (data: any, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/work-arrangements`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Work Arrangements
     * @name WorkArrangementsDetail
     * @summary Get work arrangement by ID
     * @request GET:/work-arrangements/{id}
     * @secure
     */
    workArrangementsDetail: (id: number, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/work-arrangements/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Work Arrangements
     * @name WorkArrangementsUpdate
     * @summary Update work arrangement by ID
     * @request PUT:/work-arrangements/{id}
     * @secure
     */
    workArrangementsUpdate: (
      id: number,
      data: any,
      params: RequestParams = {},
    ) =>
      this.request<any, void>({
        path: `/work-arrangements/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Work Arrangements
     * @name WorkArrangementsDelete
     * @summary Delete work arrangement by ID
     * @request DELETE:/work-arrangements/{id}
     * @secure
     */
    workArrangementsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/work-arrangements/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  health = {
    /**
     * @description Returns the health status of the API
     *
     * @name GetHealthStatus
     * @summary Health Check
     * @request GET:/health
     * @secure
     */
    getHealthStatus: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "healthy" */
          status?: string;
          /**
           * @format date-time
           * @example "2023-03-17T12:00:00.000Z"
           */
          timestamp?: string;
        },
        any
      >({
        path: `/health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  status = {
    /**
     * @description Returns the current status of the API
     *
     * @name GetApiStatus
     * @summary Get API status
     * @request GET:/status
     * @secure
     */
    getApiStatus: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "success" */
          status?: string;
          /** @example "API is running" */
          message?: string;
          data?: {
            /** @example "1.0.0" */
            version?: string;
            /** @example "production" */
            environment?: string;
            /**
             * @format date-time
             * @example "2023-03-17T12:00:00.000Z"
             */
            server_time?: string;
          };
        },
        any
      >({
        path: `/status`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
