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

export interface User {
  /** @example 1 */
  id?: number;
  /** @example "John Doe" */
  name?: string;
  /**
   * @format email
   * @example "john.doe@example.com"
   */
  email?: string;
  /** @example "employee" */
  role?: "admin" | "hr" | "employee";
  status?: "active" | "inactive";
  /** @format date-time */
  created_at?: string;
}

export interface Employee {
  id?: number;
  user_id?: number;
  employee_code?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department_id?: number;
  position_id?: number;
  employment_status?: "active" | "inactive";
  /** @format date */
  hire_date?: string;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface EmployeeDocument {
  id?: number;
  employee_id?: number;
  title?: string;
  document_url?: string;
  status?: "draft" | "active";
  created_by?: number;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface AttendanceLog {
  id?: number;
  employee_id?: number;
  event_type?: "check_in" | "check_out";
  /** @format date-time */
  timestamp?: string;
  work_arrangement_id?: number;
  ip_address?: string;
  notes?: string;
  /** @format date-time */
  created_at?: string;
}

export interface DailyAttendance {
  id?: number;
  employee_id?: number;
  /** @format date */
  date?: string;
  status?: "present" | "absent" | "late";
  /** @format date-time */
  first_check_in?: string;
  /** @format date-time */
  last_check_out?: string;
  /** @format float */
  work_hours?: number;
  notes?: string;
  /** @format date-time */
  created_at?: string;
}

export interface Department {
  id?: number;
  name?: string;
  description?: string;
  /** @default true */
  active?: boolean;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface Position {
  id?: number;
  name?: string;
  department_id?: number;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface WorkArrangement {
  id?: number;
  name?: string;
  type?: "WFA" | "WFO" | "WFH";
  /** @default false */
  is_default?: boolean;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface OvertimeRequest {
  id?: number;
  employee_id?: number;
  overtime_type_id?: number;
  /** @format date */
  date?: string;
  /** @format date-time */
  start_time?: string;
  /** @format date-time */
  end_time?: string;
  /** @format float */
  hours?: number;
  /** @format float */
  estimated_compensation?: number;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
  approved_by?: number;
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface BillingCycle {
  id?: number;
  period_name?: string;
  /** @format date */
  start_date?: string;
  /** @format date */
  end_date?: string;
  employee_count?: number;
  /** @format float */
  amount?: number;
  status?: "unpaid" | "paid";
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface Payment {
  id?: number;
  billing_cycle_id?: number;
  /** @format float */
  amount?: number;
  payment_method?: string;
  payment_reference?: string;
  /** @format date */
  payment_date?: string;
  status?: "pending" | "completed";
  created_by?: number;
  /** @format date-time */
  created_at?: string;
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
  public baseUrl: string =
    "https://hris-backend-sukamaju123.azurewebsites.net/api";
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
 * @baseUrl https://hris-backend-sukamaju123.azurewebsites.net/api
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
         * @format email
         * @example "john.doe@example.com"
         */
        email: string;
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
            token?: string;
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
        /** @example "John Doe" */
        name: string;
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
        /** @example "employee" */
        role?: "admin" | "hr" | "employee";
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
            id?: number;
            /** @example "john.doe@example.com" */
            email?: string;
            /** @example "+6281234567890" */
            phone?: string;
            /** @example "employee" */
            role?: string;
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
        AttendanceLog & {
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
        AttendanceLog & {
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
      this.request<AttendanceLog[], any>({
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
      this.request<DailyAttendance[], any>({
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
      this.request<DailyAttendance, void>({
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
    overtimeCreate: (data: OvertimeRequest, params: RequestParams = {}) =>
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
      this.request<OvertimeRequest[], any>({
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
      this.request<Department[], any>({
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
      this.request<Department, any>({
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
      this.request<Department, void>({
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
      this.request<Department, void>({
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
      this.request<WorkArrangement[], any>({
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
    workArrangementsCreate: (
      data: WorkArrangement,
      params: RequestParams = {},
    ) =>
      this.request<WorkArrangement, any>({
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
      this.request<WorkArrangement, void>({
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
      data: WorkArrangement,
      params: RequestParams = {},
    ) =>
      this.request<WorkArrangement, void>({
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
