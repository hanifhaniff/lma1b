import { NextRequest } from 'next/server';

interface CreateVoucherRequest {
  quantity: number;
  profile: string;
  userGroupId: string;
  firstName: string;
  comment: string;
}

interface Voucher {
  voucherCode: string;
  status: string;
  packageName: string;
  firstName: string;
  comment: string;
  usedQuota: number;
  userGroupId?: string | number;
  maxClients?: number;
  currentClients?: number;
}

interface ApiResponse {
  code: number;
  msg: string;
  count: number;
  list: Voucher[];
}

export async function GET(request: NextRequest) {
  try {
    // Get the access token from environment variables
    const accessToken = process.env.ACCESS_TOKEN_RUIJIE;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token not found. Please set ACCESS_TOKEN_RUIJIE in your environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract search parameters from query
    const { searchParams } = new URL(request.url);
    const searchFirstName = searchParams.get('searchFirstName');
    const searchVoucherCode = searchParams.get('searchVoucherCode');
    const listId = searchParams.get('listId') || '6435153'; // Default to '1B Office'

    // Construct the API URL with query parameters
    const apiUrl = `https://cloud-as.ruijienetworks.com/service/api/open/auth/voucher/getList/${listId}?access_token=${accessToken}&start=0&pageSize=300&tenantId=504179`;

    // Fetch data from the Ruijie API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch data from Ruijie API: ${response.status} ${response.statusText}` 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Log the actual response structure for debugging
    console.log('Ruijie API response structure:', JSON.stringify(data, null, 2));
    
    // Handle the specific response structure from the Ruijie API
    // Expected structure: { code: 0, msg: 'OK.', count: 239, list: [...] }
    let vouchers: Voucher[] = [];
    
    if (data && typeof data === 'object') {
      // Check for nested structure: data.voucherData.list
      if (data.voucherData && data.voucherData.list && Array.isArray(data.voucherData.list)) {
        vouchers = data.voucherData.list;
      } else if (Array.isArray(data.list)) {
        // Extract vouchers from the list property
        vouchers = data.list;
      } else if (Array.isArray(data)) {
        // Fallback: if the response is directly an array
        vouchers = data;
      } else {
        // If we can't identify the structure, return the actual response for debugging
        console.error('Unexpected API response structure:', data);
        return new Response(
          JSON.stringify({
            error: 'Unexpected API response structure. The API did not return data with a "list" property.',
            actualResponse: data
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid API response format.',
          actualResponse: data
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform and validate the voucher data to match our interface
    const transformedVouchers = vouchers.map((voucher: any) => {
      // Convert status from numeric string to text
      let statusText = 'unknown';
      if (voucher.status === '1') statusText = 'inactive';
      else if (voucher.status === '2') statusText = 'active';
      else if (voucher.status === '3') statusText = 'expired';
      
      return {
        voucherCode: voucher.voucherCode || '',
        status: statusText,
        packageName: voucher.packageName || '',
        firstName: voucher.firstName || '',
        comment: voucher.comment || '',
        usedQuota: voucher.usedQuota || 0,
        userGroupId: voucher.userGroupId,
        maxClients: voucher.maxClients || 0,
        currentClients: voucher.currentClients || 0
      };
    });
    
    // Validate that we have the required fields in each transformed voucher
    for (const voucher of transformedVouchers) {
      if (
        typeof voucher !== 'object' ||
        typeof voucher.voucherCode === 'undefined' ||
        typeof voucher.status === 'undefined' ||
        typeof voucher.packageName === 'undefined' ||
        typeof voucher.firstName === 'undefined' ||
        typeof voucher.comment === 'undefined' ||
        typeof voucher.usedQuota === 'undefined'
      ) {
        console.warn('Voucher missing required fields:', voucher);
        return new Response(
          JSON.stringify({
            error: 'Invalid voucher data: missing required fields'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Apply search filters if provided
    let filteredVouchers = transformedVouchers;
    
    if (searchFirstName) {
      filteredVouchers = filteredVouchers.filter(voucher =>
        voucher.firstName.toLowerCase().includes(searchFirstName.toLowerCase())
      );
    }
    
    if (searchVoucherCode) {
      filteredVouchers = filteredVouchers.filter(voucher =>
        voucher.voucherCode.toLowerCase().includes(searchVoucherCode.toLowerCase())
      );
    }

    // Return the filtered vouchers
    return new Response(JSON.stringify(filteredVouchers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching data from Ruijie API:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the access token from environment variables
    const accessToken = process.env.ACCESS_TOKEN_RUIJIE;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token not found. Please set ACCESS_TOKEN_RUIJIE in your environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract listId from query parameters, with a default value
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId') || '6435153'; // Default to '1B Office'

    // Parse the request body
    const body: CreateVoucherRequest = await request.json();
    
    // Validate required fields
    const { quantity, profile, userGroupId, firstName, comment } = body;
    
    if (!quantity || !profile || !userGroupId || !firstName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: quantity, profile, userGroupId, firstName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construct the API URL
    const apiUrl = `https://cloud-as.ruijienetworks.com/service/api/open/auth/voucher/create/${listId}?access_token=${accessToken}`;
    console.log(apiUrl)
    // Prepare the request body
    const requestBody = {
      quantity,
      profile,
      userGroupId,
      firstName,
      comment: comment || ''
    };

    // Make the POST request to Ruijie API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ruijie API error response:', errorData);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create voucher: ${response.status} ${response.statusText}`,
          details: errorData
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Log the response for debugging
    console.log('Ruijie API create response:', JSON.stringify(data, null, 2));
    
    // Return the response from the API
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error creating voucher:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}