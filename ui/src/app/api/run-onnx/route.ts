import { NextRequest, NextResponse } from 'next/server';
import * as ort from 'onnxruntime-node';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { tensor } = await req.json();
    if (!tensor || !Array.isArray(tensor) || tensor.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty tensor input.' }, { status: 400 });
    }

    // Load the ONNX model from the public directory (pass file path to onnxruntime-node)
    const modelPath = path.join(process.cwd(), 'public', 'model.onnx');
    const session = await ort.InferenceSession.create(modelPath);

    // Prepare the input tensor: Float32, shape [N, 4]
    const flat = tensor.flat();
    const dims = [tensor.length, 4];
    const inputTensor = new ort.Tensor('float32', Float32Array.from(flat), dims);

    // Debug logs for ONNX
    console.log('ONNX inputNames:', session.inputNames);
    console.log('ONNX outputNames:', session.outputNames);
    console.log('Input tensor dims:', inputTensor.dims, 'type:', inputTensor.type);

    // Log input names (inputMetadata property does not exist on InferenceSession in onnxruntime-node)
    // If you need input metadata, you can use session.inputNames and session.inputMetadata if available in your version.
    // Otherwise, remove this log.
    // console.log('Full inputMetadata:', inputMetadata);
    // Use the dynamic input name from the model
    const inputName = session.inputNames[0];
    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = inputTensor;
    console.log('Feeds (dynamic):', feeds);

    // Run inference 
    const output = await session.run(feeds);

    // Assume output is the first output tensor (adjust if needed)
    const outputNames = session.outputNames;
    const resultTensor = output[outputNames[0]];
    const result = Array.from(resultTensor.data as Iterable<number>);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error('ONNX API error:', err);
    let message = 'Unexpected error';
    let stack = undefined;
    if (err && typeof err === 'object') {
      if (isErrorWithMessageAndStack(err)) {
        message = err.message;
        stack = err.stack;
      }

function isErrorWithMessageAndStack(error: unknown): error is { message: string; stack?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    ('stack' in error ? typeof (error as { stack?: unknown }).stack === 'string' : true)
  );
}
    }
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}
