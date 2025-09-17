import { loadEnvironmentVariables } from '../config/env';

interface NetLicensingLicenseeResponse {
  licenseeNumber: string;
  productNumber: string;
}

interface NetLicensingLicenseResponse {
  licenseNumber: string;
  licenseeNumber: string;
  licenseTemplateNumber: string;
}

export class NetLicensingService {
  private apiKey: string | null = null;
  private productId: string | null = null;
  private baseUrl = 'https://go.netlicensing.io/core/v2/rest';

  private initializeIfNeeded() {
    if (!this.apiKey || !this.productId) {
      // Load environment variables
      loadEnvironmentVariables();
      
      this.apiKey = process.env.NET_LICENCE_API_KEY!;
      this.productId = process.env.NET_LICENCE_PRODUCT_ID!;
      
      if (!this.apiKey || !this.productId) {
        throw new Error('NetLicensing API key or Product ID not configured');
      }
    }
  }

  /**
   * Create a licensee for a user
   * @param userEmail - The user's email to use as the licensee name
   * @returns Promise containing the licensee number
   */
  async createLicensee(userEmail: string): Promise<string> {
    try {
      this.initializeIfNeeded();
      const formData = new URLSearchParams({
        productNumber: this.productId!,
        name: userEmail,
      });
      console.log("~!~formData", formData);
      console.log("~!~productNumber being used:", this.productId);
      console.log("~!~apiKey being used:", this.apiKey);

      const response = await fetch(`${this.baseUrl}/licensee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`apiKey:${this.apiKey!}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse XML response to extract licensee number
      const xmlData = await response.text();
      console.log("~!~NetLicensing createLicensee response:", xmlData);
      const licenseeNumberMatch = xmlData.match(/<ns2:property name="number">([^<]+)<\/ns2:property>/);
      
      if (!licenseeNumberMatch) {
        throw new Error('Failed to extract licensee number from response');
      }

      const licenseeNumber = licenseeNumberMatch[1];
      console.log(`✅ Created licensee: ${licenseeNumber} for user: ${userEmail}`);
      
      return licenseeNumber;
    } catch (error: any) {
      console.error('❌ Failed to create licensee:', error.message);
      throw new Error(`Failed to create licensee: ${error.message}`);
    }
  }

  /**
   * Create a license for a licensee using a specific license template
   * @param licenseeNumber - The licensee number
   * @param licenseTemplateNumber - The license template number
   * @returns Promise containing the license number
   */
  async createLicense(licenseeNumber: string, licenseTemplateNumber: string): Promise<string> {
    try {
      this.initializeIfNeeded();
      const formData = new URLSearchParams({
        productNumber: this.productId!,
        licenseTemplateNumber: licenseTemplateNumber,
        licenseeNumber: licenseeNumber,
        active: 'true'
      });
      const response = await fetch(`${this.baseUrl}/license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`apiKey:${this.apiKey!}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse XML response to extract license number
      const xmlData = await response.text();
      const licenseNumberMatch = xmlData.match(/<ns2:property name="number">([^<]+)<\/ns2:property>/);
      
      if (!licenseNumberMatch) {
        throw new Error('Failed to extract license number from response');
      }

      const licenseNumber = licenseNumberMatch[1];
      console.log(`✅ Created license: ${licenseNumber} for licensee: ${licenseeNumber}`);
      
      return licenseNumber;
    } catch (error: any) {
      console.error('❌ Failed to create license:', error.message);
      throw new Error(`Failed to create license: ${error.message}`);
    }
  }

  /**
   * Generate both licensee and license for a user purchase
   * @param userEmail - The user's email
   * @param licenseTemplateNumber - The license template number from the product
   * @returns Promise containing both licensee and license numbers
   */
  async generateUserLicense(userEmail: string, licenseTemplateNumber: string): Promise<{
    licenseeNumber: string;
    licenseNumber: string;
  }> {
    try {
      console.log(`🎫 Generating license for user: ${userEmail} with template: ${licenseTemplateNumber}`);
      
      // Step 1: Create licensee
      const licenseeNumber = await this.createLicensee(userEmail);
      
      // Step 2: Create license for the licensee
      const licenseNumber = await this.createLicense(licenseeNumber, licenseTemplateNumber);
      
      console.log(`✅ Successfully generated license for ${userEmail}:`, {
        licenseeNumber,
        licenseNumber,
        licenseTemplateNumber
      });
      
      return {
        licenseeNumber,
        licenseNumber
      };
    } catch (error) {
      console.error(`❌ Failed to generate license for ${userEmail}:`, error);
      throw error;
    }
  }
}

export default new NetLicensingService();