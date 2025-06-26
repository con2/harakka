import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    // Get config from environment variables
    const endpoint =
      this.configService.get("SUPABASE_STORAGE_URL") ||
      "https://rcbddkhvysexkvgqpcud.supabase.co/storage/v1/s3";
    const region = this.configService.get("S3_REGION") || "eu-north-1";
    this.bucketName = this.configService.get("S3_BUCKET") || "item-images";
    const accessKeyId = "c01e3b3dfebb6aaabf905fe2052ffc76"; //TODO: remove after debugging
    const secretAccessKey =
      "15c229f33907a0709650556a471347fc21ed170e56b14a581606095c45daa521"; //TODO: remove after debugging

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn("S3 credentials not properly configured");
    }

    // Create S3 client with Supabase S3-compatible endpoint
    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for Supabase Storage
    });

    this.logger.log(`S3 client initialized with endpoint: ${endpoint}`);
  }

  /**
   * Upload a file to S3 storage
   */
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      this.logger.log(`Uploading file to S3: ${this.bucketName}/${key}`);

      // Use multipart upload for better handling of large files
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        },
      });

      await upload.done();

      // Generate PUBLIC URL - fix the URL format
      const projectId = this.configService.get("SUPABASE_PROJECT_ID");
      const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${this.bucketName}/${key}`;

      this.logger.log(`File uploaded successfully: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3 storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from S3: ${this.bucketName}/${key}`);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`S3 deletion failed: ${error.message}`);
    }
  }

  /**
   * Get base public URL for the bucket
   */
  getBaseUrl(): string {
    return `${this.configService.get("SUPABASE_STORAGE_URL")}/${this.bucketName}`;
  }
}
