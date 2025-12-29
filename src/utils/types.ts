/**
 * This is a file for all types defined outside of class code
 *
 * All types here can be exported
 */

// Files uploaded from req (IncommingMessage -> node:http)
export interface File {
  filename: string;
  mime: string;
  buffer: Buffer;
}
