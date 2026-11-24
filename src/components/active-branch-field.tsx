'use client';

import { Field, TextInput } from '@/components/ui/field';
import { useActiveWorkspace } from '@/lib/workspace-context';

export function ActiveBranchField({ label = 'Site' }: { label?: string }) {
  const branch = useActiveWorkspace();
  return (
    <Field label={label}>
      <TextInput
        readOnly
        value={branch?.name ?? ''}
        placeholder="Choose a branch in the workspace header"
      />
    </Field>
  );
}
