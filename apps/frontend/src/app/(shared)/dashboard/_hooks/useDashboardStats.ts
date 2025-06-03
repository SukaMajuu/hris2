import { useQuery } from '@tanstack/react-query';
import { useEmployeesQuery } from '@/api/queries/employee.queries';
import type { Employee } from '@/types/employee';

export interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  activeEmployees: number;
  resignedEmployees: number;
}

export function useDashboardStats() {
  const { data: employeesResponse, isLoading, error } = useEmployeesQuery(1, 50, {});
  const {
    data,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats', employeesResponse],
    queryFn: async (): Promise<DashboardStats> => {
      if (!employeesResponse?.data?.items) {
        console.log('No employee data available yet');
        return {
          totalEmployees: 0,
          newHires: 0,
          activeEmployees: 0,
          resignedEmployees: 0,
        };
      }

      console.log('Dashboard Stats Debug:', {
        response: employeesResponse,
        dataStructure: employeesResponse.data,
        items: employeesResponse.data.items,
        totalItems: employeesResponse.data.pagination.total_items,
      });

      const employeesData = employeesResponse.data.items;
      const totalEmployees = employeesResponse.data.pagination.total_items;      // Debug: Log first few employees to understand data structure
      console.log('First few employees:', employeesData.slice(0, 3));      // Calculate new hires (employees hired in the last 30 days based on hire_date)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      console.log('Date filter - 30 days ago:', thirtyDaysAgo);
      console.log('Current date:', new Date());// Log all employee hire_date for debugging
      console.log('All employee hire dates:', employeesData.map((emp: Employee) => ({
        name: emp.first_name,
        hire_date: emp.hire_date,
        parsed_date: emp.hire_date ? new Date(emp.hire_date) : null,
        is_valid_date: emp.hire_date ? !isNaN(new Date(emp.hire_date).getTime()) : false
      })));

      const newHires = employeesData.filter((employee: Employee) => {
        console.log('Checking employee hire date:', {
          name: employee.first_name,
          hire_date: employee.hire_date,
          hasHireDate: !!employee.hire_date,
          isEmptyString: employee.hire_date === "",
          length: employee.hire_date?.length
        });
        
        // Check for empty string, null, or undefined
        if (!employee.hire_date || employee.hire_date.trim() === "") {
          console.log('Employee has no valid hire_date field (empty or null)');
          return false;
        }
        
        const hireDate = new Date(employee.hire_date);
        console.log('Parsed hire date:', hireDate);
        console.log('Is valid date:', !isNaN(hireDate.getTime()));
        
        if (isNaN(hireDate.getTime())) {
          console.log('Invalid hire date format');
          return false;
        }
        
        const isNewHire = hireDate >= thirtyDaysAgo;
        console.log('Is new hire?', isNewHire, 'Hired:', hireDate, 'Threshold:', thirtyDaysAgo);
        
        if (isNewHire) {
          console.log('✅ New hire found:', {
            name: employee.first_name,
            hire_date: employee.hire_date,
            hireDate,
          });
        }
        return isNewHire;
      }).length;

      // Calculate active employees (employment_status is true)
      const activeEmployees = employeesData.filter((employee: Employee) => {
        const isActive = employee.employment_status === true;
        return isActive;
      }).length;

      // Calculate resigned employees (employment_status is false)
      const resignedEmployees = employeesData.filter((employee: Employee) => {
        const isResigned = employee.employment_status === false;
        return isResigned;
      }).length;

      console.log('Calculated stats:', {
        totalEmployees,
        newHires,
        activeEmployees,
        resignedEmployees,
        totalFromItems: employeesData.length,
      });

      return {
        totalEmployees,
        newHires,
        activeEmployees,
        resignedEmployees,
      };
    },
    enabled: !!employeesResponse?.data?.items, // Only run when employee data is available    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug error if any
  if (error) {
    console.error('Error fetching employees:', error);
  }
  if (statsError) {
    console.error('Error calculating stats:', statsError);
  }

  return {
    stats: data,
    loading: isLoading || statsLoading,
    error: (error || statsError) as Error | null,
    refetch,
  };
}
