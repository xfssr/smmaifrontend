import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Play, RefreshCw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "../lib/api";

type AdminSection =
  | "dashboard"
  | "users"
  | "providers"
  | "models"
  | "routes"
  | "prompts"
  | "api-keys-secrets"
  | "logs-provider-calls"
  | "costs-tokens"
  | "test-playground";

type AdminAiRuntimeSetting = {
  section: string;
  key: string;
  value: string | null;
  effectiveValue: string;
  source: "database" | "environment";
  isSecret: boolean;
  metadata: unknown;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type AdminAiSettingMetadata = Record<string, unknown>;

type RouteDraft = {
  routeKey: string;
  title: string;
  capability: string;
  providerKey: string;
  modelKey: string;
  fallbackRouteKey: string;
  enabled: boolean;
  timeoutMs: string;
  maxOutputTokens: string;
  params: string;
};

type PromptDraft = {
  promptId: string;
  promptKey: string;
  routeKey: string;
  version: string;
  status: "draft" | "active" | "archived";
  title: string;
  systemPrompt: string;
  userTemplate: string;
  jsonSchema: string;
  variables: string;
  metadata: string;
};

const AI_ROUTE_CAPABILITIES = ["chat", "json", "vision", "image_edit", "image_generation", "video", "moderation"] as const;

type AdminAiRuntimeSettingsResponse = {
  env: Record<string, string>;
  settings: AdminAiRuntimeSetting[];
};

type AdminAiPageProps = {
  section: string;
  onNavigate: (path: string) => void;
};

type AdminSectionConfig = {
  id: AdminSection;
  title: string;
  description: string;
};

const ADMIN_SECTIONS: AdminSectionConfig[] = [
  { id: "dashboard", title: "Dashboard", description: "Quick admin overview for runtime settings." },
  { id: "users", title: "Users / usage", description: "Runtime overrides for usage limits and user controls." },
  { id: "providers", title: "Providers / routers", description: "Routing provider matrix and routing options." },
  { id: "models", title: "Models", description: "Model values in the `models` section." },
  { id: "routes", title: "Routes", description: "Section for route mapping and fallback behavior." },
  { id: "prompts", title: "Prompts", description: "Prompt variants and runtime prompt flags." },
  { id: "api-keys-secrets", title: "API keys / secrets", description: "Planned: secure key store controls." },
  { id: "logs-provider-calls", title: "Logs / provider calls", description: "Runtime options for provider call logging." },
  { id: "costs-tokens", title: "Costs / tokens", description: "Token and budget guards for runtime runtime flow." },
  { id: "test-playground", title: "Test playground", description: "Planned: quick checks after runtime updates." },
];

const EDITABLE_SECTIONS = new Set<AdminSection>([
  "users",
  "providers",
  "models",
  "routes",
  "prompts",
  "costs-tokens",
  "logs-provider-calls",
]);

const SECTION_LABEL_BY_ID = ADMIN_SECTIONS.reduce((acc, item) => {
  acc[item.id] = item.title;
  return acc;
}, {} as Record<AdminSection, string>);

function rowIdentity(section: string, key: string) {
  return `${section}::${key}`;
}

function normalizeMetadataValue(value: unknown) {
  if (value === null || value === undefined) return "{}";
  if (typeof value === "string") return value.trim() || "{}";
  if (typeof value !== "object" || Array.isArray(value)) return JSON.stringify(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

function parseMetadata(value: string) {
  const source = value.trim();
  if (!source) return {};
  const parsed = JSON.parse(source);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Metadata must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function parseJsonArray(value: string) {
  const source = value.trim();
  if (!source) return [];
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed)) {
    throw new Error("Metadata must be a JSON array");
  }
  return parsed as unknown[];
}

function parsePromptStatus(value: unknown): "draft" | "active" | "archived" {
  return value === "active" || value === "archived" ? value : "draft";
}

function asMetadataObject(value: unknown): AdminAiSettingMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as AdminAiSettingMetadata;
}

function toBool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function toText(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function toNumberText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return "";
}

function parseRouteParams(value: string) {
  const source = value.trim();
  if (!source) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Params must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function parsePromptPayloadObject(value: string) {
  const source = value.trim();
  if (!source) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Payload must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function normalizeSection(section: string | null): AdminSection {
  const candidate = section?.trim().toLowerCase() || "dashboard";
  const existing = ADMIN_SECTIONS.find((entry) => entry.id === candidate);
  return existing ? existing.id : "dashboard";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const AdminAiPage: React.FC<AdminAiPageProps> = ({ section, onNavigate }) => {
  const activeSection = useMemo(() => normalizeSection(section), [section]);
  const isEditableSection = EDITABLE_SECTIONS.has(activeSection);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [settingsResponse, setSettingsResponse] = useState<AdminAiRuntimeSettingsResponse | null>(null);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [draftSecretValues, setDraftSecretValues] = useState<Record<string, boolean>>({});
  const [draftMetadataValues, setDraftMetadataValues] = useState<Record<string, string>>({});
  const [routeDrafts, setRouteDrafts] = useState<Record<string, RouteDraft>>({});
  const [promptDrafts, setPromptDrafts] = useState<Record<string, PromptDraft>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIsSecret, setNewIsSecret] = useState(false);
  const [newMetadata, setNewMetadata] = useState("{}");
  const [newRouteTitle, setNewRouteTitle] = useState("");
  const [newRouteCapability, setNewRouteCapability] = useState("image_generation");
  const [newRouteProviderKey, setNewRouteProviderKey] = useState("");
  const [newRouteModelKey, setNewRouteModelKey] = useState("");
  const [newRouteFallback, setNewRouteFallback] = useState("");
  const [newRouteEnabled, setNewRouteEnabled] = useState(true);
  const [newRouteTimeoutMs, setNewRouteTimeoutMs] = useState("");
  const [newRouteMaxOutputTokens, setNewRouteMaxOutputTokens] = useState("");
  const [newRouteParams, setNewRouteParams] = useState("{}");
  const [newPromptKey, setNewPromptKey] = useState("");
  const [newPromptRouteKey, setNewPromptRouteKey] = useState("");
  const [newPromptVersion, setNewPromptVersion] = useState("");
  const [newPromptStatus, setNewPromptStatus] = useState<"draft" | "active" | "archived">("draft");
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptSystemPrompt, setNewPromptSystemPrompt] = useState("");
  const [newPromptUserTemplate, setNewPromptUserTemplate] = useState("");
  const [newPromptJsonSchema, setNewPromptJsonSchema] = useState("{}");
  const [newPromptVariables, setNewPromptVariables] = useState("[]");
  const [newPromptMetadata, setNewPromptMetadata] = useState("{}");

  const hasAdminAuth =
    !!import.meta.env.VITE_ADMIN_KEY?.trim() ||
    (typeof window !== "undefined" && !!localStorage.getItem("adminAccessKey")?.trim());

  const saveAdminKey = () => {
    const nextKey = adminKeyInput.trim();
    if (!nextKey) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("adminAccessKey", nextKey);
    }
    setAdminAuthError(null);
    setError(null);
    setAdminKeyInput("");
    void loadSectionData();
  };

  const clearAdminKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAccessKey");
    }
    setAdminAuthError("Введённый ключ не подходит. Вставьте новый.");
    setError(null);
    setSettingsResponse(null);
    setDraftValues({});
    setDraftSecretValues({});
    setDraftMetadataValues({});
    setRouteDrafts({});
    setPromptDrafts({});
  };

  const loadSectionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const shouldLoadAllForSections = activeSection === "routes" || activeSection === "prompts";
      const params = shouldLoadAllForSections
        ? { section: "all", includeSecrets: true }
        : { section: activeSection, includeSecrets: true };
      const data = await api.adminAiSettings(params);
      setSettingsResponse(data);
      const defaults = (data.settings ?? []).reduce<{
        values: Record<string, string>;
        secrets: Record<string, boolean>;
        metadata: Record<string, string>;
        routeDrafts: Record<string, RouteDraft>;
        promptDrafts: Record<string, PromptDraft>;
      }>(
        (acc, item) => {
          const key = rowIdentity(item.section, item.key);
          acc.values[key] = item.value ?? item.effectiveValue;
          acc.secrets[key] = item.isSecret;
          acc.metadata[key] = normalizeMetadataValue(item.metadata);
          if (item.section === "routes") {
            const metadata = asMetadataObject(item.metadata);
            acc.routeDrafts[key] = {
              routeKey: String(metadata.routeKey ?? item.key),
              title: toText(metadata.title, String(metadata.routeKey ?? item.key)),
              capability: toText(metadata.capability, "image_generation"),
              providerKey: toText(metadata.providerKey, ""),
              modelKey: toText(metadata.modelKey, ""),
              fallbackRouteKey: metadata.fallbackRouteKey ? String(metadata.fallbackRouteKey) : "",
              enabled: toBool(metadata.enabled, true),
              timeoutMs: toNumberText(metadata.timeoutMs),
              maxOutputTokens: toNumberText(metadata.maxOutputTokens),
              params: normalizeMetadataValue(metadata.params)
            };
          }
          if (item.section === "prompts") {
            const metadata = asMetadataObject(item.metadata);
            const promptStatus = parsePromptStatus(metadata.status);
            acc.promptDrafts[key] = {
              promptId: String(metadata.id ?? ""),
              promptKey: String(metadata.promptKey ?? ""),
              routeKey: String(metadata.routeKey ?? ""),
              version: metadata.version != null ? String(metadata.version) : "",
              status: promptStatus,
              title: toText(metadata.title, ""),
              systemPrompt: toText(metadata.systemPrompt, ""),
              userTemplate: toText(metadata.userTemplate, ""),
              jsonSchema: normalizeMetadataValue(metadata.jsonSchema),
              variables: normalizeMetadataValue(metadata.variables),
              metadata: normalizeMetadataValue(metadata.metadata)
            };
          }
          return acc;
        },
        { values: {}, secrets: {}, metadata: {}, routeDrafts: {}, promptDrafts: {} }
      );
      setDraftValues(defaults.values);
      setDraftSecretValues(defaults.secrets);
      setDraftMetadataValues(defaults.metadata);
      setRouteDrafts(defaults.routeDrafts);
      setPromptDrafts(defaults.promptDrafts);
      setNewKey("");
      setNewValue("");
      setNewIsSecret(false);
      setNewMetadata("{}");
      setNewRouteTitle("");
      setNewRouteCapability("image_generation");
      setNewRouteProviderKey("");
      setNewRouteModelKey("");
      setNewRouteFallback("");
      setNewRouteEnabled(true);
      setNewRouteTimeoutMs("");
      setNewRouteMaxOutputTokens("");
      setNewRouteParams("{}");
      setNewPromptKey("");
      setNewPromptRouteKey("");
      setNewPromptVersion("");
      setNewPromptStatus("draft");
      setNewPromptTitle("");
      setNewPromptSystemPrompt("");
      setNewPromptUserTemplate("");
      setNewPromptJsonSchema("{}");
      setNewPromptVariables("[]");
      setNewPromptMetadata("{}");
      setAdminAuthError(null);
    } catch (apiError) {
      const status = (apiError as { status?: number })?.status;
      if (status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminAccessKey");
        }
        setAdminAuthError("Неверный пароль админа или ключ не актуален.");
      } else {
        setAdminAuthError(null);
      }
      setError(apiError instanceof Error ? apiError.message : "Failed to load admin runtime settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSectionData();
  }, [activeSection]);

  const modelsSettings = useMemo(
    () => (settingsResponse?.settings ?? []).filter((item) => item.section === "models"),
    [settingsResponse?.settings]
  );
  const providersSettings = useMemo(
    () => (settingsResponse?.settings ?? []).filter((item) => item.section === "providers"),
    [settingsResponse?.settings]
  );
  const routesSettings = useMemo(
    () => (settingsResponse?.settings ?? []).filter((item) => item.section === "routes"),
    [settingsResponse?.settings]
  );
  const promptStatusOptions: Array<"draft" | "active" | "archived"> = ["draft", "active", "archived"];

  const sectionSettings = useMemo(
    () => (settingsResponse?.settings ?? []).filter((item) => item.section === activeSection),
    [activeSection, settingsResponse?.settings]
  );

  const sectionStats = useMemo(() => {
    if (!settingsResponse) return [];
    return Object.entries(settingsResponse.env).map(([key, value]) => ({ key, value }));
  }, [settingsResponse]);

  const saveSetting = async (item: AdminAiRuntimeSetting) => {
    const identity = rowIdentity(item.section, item.key);
    const rawValue = draftValues[identity] ?? "";
    const normalizedCurrentMetadata = normalizeMetadataValue(item.metadata);
    const rawMetadata = draftMetadataValues[identity] ?? "{}";
    const metadataEdited = normalizedCurrentMetadata.trim() !== rawMetadata.trim();
    const nextValue = rawValue;

    const secretValue = draftSecretValues[identity] ?? false;
    const valueChanged = nextValue !== (item.value ?? item.effectiveValue);
    const secretChanged = secretValue !== item.isSecret;
    const metadataChanged = metadataEdited;
    const hasChanges = valueChanged || secretChanged || metadataChanged;

    if (!hasChanges) return;

    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      const payloadMetadata = metadataEdited ? parseMetadata(rawMetadata.trim() || "{}") : undefined;
      await api.adminAiUpsertSetting(item.section, item.key, {
        value: nextValue,
        isSecret: secretValue,
        ...(payloadMetadata ? { metadata: payloadMetadata } : {}),
      });
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to save ${item.key}`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const saveRouteSetting = async (item: AdminAiRuntimeSetting, draft: RouteDraft) => {
    const identity = rowIdentity(item.section, item.key);
    if (!draft.providerKey || !draft.modelKey || !draft.title.trim() || !draft.routeKey.trim()) {
      setError("Route routeKey, providerKey and modelKey are required.");
      return;
    }
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiUpdateRoute(draft.routeKey, {
        routeKey: draft.routeKey,
        title: draft.title,
        capability: draft.capability || "image_generation",
        providerKey: draft.providerKey,
        modelKey: draft.modelKey,
        fallbackRouteKey: draft.fallbackRouteKey || null,
        enabled: draft.enabled,
        timeoutMs: draft.timeoutMs ? Number(draft.timeoutMs) : null,
        maxOutputTokens: draft.maxOutputTokens ? Number(draft.maxOutputTokens) : null,
        params: parseRouteParams(draft.params),
      });
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to save route ${draft.routeKey}`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const savePromptSetting = async (item: AdminAiRuntimeSetting, draft: PromptDraft) => {
    if (!draft.promptId) {
      setError("Prompt internal id is missing.");
      return;
    }
    if (!draft.routeKey.trim() || !draft.promptKey.trim() || !draft.userTemplate.trim()) {
      setError("Prompt key, route and user template are required.");
      return;
    }
    const identity = rowIdentity(item.section, item.key);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiUpdatePrompt(draft.promptId, {
        promptKey: draft.promptKey,
        routeKey: draft.routeKey,
        version: draft.version ? Number(draft.version) : undefined,
        status: draft.status,
        title: draft.title || null,
        systemPrompt: draft.systemPrompt || null,
        userTemplate: draft.userTemplate,
        jsonSchema: parsePromptPayloadObject(draft.jsonSchema),
        variables: parseJsonArray(draft.variables),
        metadata: parseMetadata(draft.metadata),
      });
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to save prompt ${draft.promptKey}`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const testRoute = async (routeKey: string) => {
    const identity = rowIdentity("routes", routeKey);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      const response = await api.adminAiTestRoute(routeKey);
      setError(`Route test: ${JSON.stringify(response, null, 2)}`);
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to test route ${routeKey}`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const testPrompt = async (item: AdminAiRuntimeSetting, promptId: string) => {
    const identity = rowIdentity(item.section, item.key);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      const response = await api.adminAiTestPrompt(promptId);
      setError(`Prompt test: ${JSON.stringify(response, null, 2)}`);
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to test prompt`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const activatePrompt = async (item: AdminAiRuntimeSetting, promptId: string) => {
    const identity = rowIdentity(item.section, item.key);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiActivatePrompt(promptId);
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to activate prompt`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const resetSetting = async (section: string, key: string) => {
    const identity = rowIdentity(section, key);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiDeleteSetting(section, key);
      await loadSectionData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Failed to reset ${key}`);
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const saveNewSetting = async () => {
    if (activeSection === "routes") {
      await saveNewRouteSetting();
      return;
    }
    if (activeSection === "prompts") {
      await saveNewPromptSetting();
      return;
    }
    const key = newKey.trim();
    const value = newValue.trim();
    if (!key || !value || !isEditableSection) return;
    const identity = rowIdentity(activeSection, key);
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      const metadata = parseMetadata(newMetadata);
      await api.adminAiUpsertSetting(activeSection, key, {
        value,
        isSecret: newIsSecret,
        metadata,
      });
      await loadSectionData();
      setNewKey("");
      setNewValue("");
      setNewIsSecret(false);
      setNewMetadata("{}");
    } catch (apiError) {
      if (apiError instanceof SyntaxError || (apiError instanceof Error && apiError.message === "Metadata must be a JSON object")) {
        setError("Metadata must be a valid JSON object");
      } else {
        setError(apiError instanceof Error ? apiError.message : "Failed to add section setting");
      }
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const saveNewRouteSetting = async () => {
    if (!newKey.trim() || !newRouteTitle.trim() || !newRouteProviderKey.trim() || !newRouteModelKey.trim()) {
      setError("Fill routeKey, title, provider and model.");
      return;
    }
    const identity = rowIdentity(activeSection, newKey.trim());
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiCreateRoute({
        routeKey: newKey.trim(),
        title: newRouteTitle.trim(),
        capability: newRouteCapability,
        providerKey: newRouteProviderKey.trim(),
        modelKey: newRouteModelKey.trim(),
        fallbackRouteKey: newRouteFallback || null,
        enabled: newRouteEnabled,
        timeoutMs: newRouteTimeoutMs ? Number(newRouteTimeoutMs) : null,
        maxOutputTokens: newRouteMaxOutputTokens ? Number(newRouteMaxOutputTokens) : null,
        params: parseRouteParams(newRouteParams),
      });
      await loadSectionData();
      setNewKey("");
      setNewRouteTitle("");
      setNewRouteCapability("image_generation");
      setNewRouteProviderKey("");
      setNewRouteModelKey("");
      setNewRouteFallback("");
      setNewRouteEnabled(true);
      setNewRouteTimeoutMs("");
      setNewRouteMaxOutputTokens("");
      setNewRouteParams("{}");
    } catch (apiError) {
      if (apiError instanceof SyntaxError || (apiError instanceof Error && apiError.message === "Params must be a JSON object")) {
        setError("Route params must be a valid JSON object");
      } else {
        setError(apiError instanceof Error ? apiError.message : "Failed to add route");
      }
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const saveNewPromptSetting = async () => {
    if (!newPromptKey.trim() || !newPromptRouteKey.trim() || !newPromptUserTemplate.trim()) {
      setError("Fill promptKey, routeKey and userTemplate.");
      return;
    }
    const identity = rowIdentity(activeSection, newPromptKey.trim());
    setRowBusy((prev) => ({ ...prev, [identity]: true }));
    try {
      await api.adminAiCreatePrompt({
        promptKey: newPromptKey.trim(),
        routeKey: newPromptRouteKey.trim(),
        version: newPromptVersion ? Number(newPromptVersion) : undefined,
        status: newPromptStatus,
        title: newPromptTitle || null,
        systemPrompt: newPromptSystemPrompt || null,
        userTemplate: newPromptUserTemplate,
        jsonSchema: parsePromptPayloadObject(newPromptJsonSchema),
        variables: parseJsonArray(newPromptVariables),
        metadata: parseMetadata(newPromptMetadata),
      });
      await loadSectionData();
      setNewPromptKey("");
      setNewPromptRouteKey("");
      setNewPromptVersion("");
      setNewPromptStatus("draft");
      setNewPromptTitle("");
      setNewPromptSystemPrompt("");
      setNewPromptUserTemplate("");
      setNewPromptJsonSchema("{}");
      setNewPromptVariables("[]");
      setNewPromptMetadata("{}");
    } catch (apiError) {
      if (
        apiError instanceof SyntaxError ||
        (apiError instanceof Error &&
          (apiError.message === "Payload must be a JSON object" || apiError.message === "Metadata must be a JSON object"))
      ) {
        setError("Prompt JSON fields must be valid objects/arrays");
      } else {
        setError(apiError instanceof Error ? apiError.message : "Failed to add prompt");
      }
    } finally {
      setRowBusy((prev) => ({ ...prev, [identity]: false }));
    }
  };

  const getRouteModelOptions = (providerKey: string, capability: string) => {
    const routeModelOptions = modelsSettings
      .map((item) => {
        const metadata = asMetadataObject(item.metadata);
        return {
          modelKey: toText(metadata.modelKey, ""),
          providerKey: toText(metadata.providerKey, ""),
          capability: toText(metadata.capability, ""),
        };
      })
      .filter(
        (model) => model.modelKey && model.providerKey === providerKey && model.capability === capability
      )
      .sort((a, b) => a.modelKey.localeCompare(b.modelKey));
    return routeModelOptions;
  };

  const getRouteKeys = () => {
    return routesSettings
      .map((item) => toText(asMetadataObject(item.metadata).routeKey, item.key))
      .filter((routeKey, index, all) => all.indexOf(routeKey) === index)
      .sort((a, b) => a.localeCompare(b));
  };

  const renderRoutesSection = () => {
    const routeRows = sectionSettings;
    const routeKeys = getRouteKeys();
    const addBusyIdentity = rowIdentity(activeSection, newKey);
    const canAddRoute =
      newKey.trim() &&
      newRouteTitle.trim() &&
      newRouteProviderKey &&
      newRouteModelKey;
    const addModelOptions = getRouteModelOptions(newRouteProviderKey, newRouteCapability);

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {ADMIN_SECTIONS.find((entry) => entry.id === activeSection)?.description}
        </p>
        <div className="glass-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight">Routes settings</h3>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs"
              onClick={loadSectionData}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
          <div className="mb-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Add route</h4>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={newKey}
                onChange={(event) => setNewKey(event.target.value)}
                placeholder="route key"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <input
                value={newRouteTitle}
                onChange={(event) => setNewRouteTitle(event.target.value)}
                placeholder="title"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <select
                value={newRouteCapability}
                onChange={(event) => {
                  setNewRouteCapability(event.target.value);
                  setNewRouteModelKey("");
                }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                {AI_ROUTE_CAPABILITIES.map((capability) => (
                  <option key={capability} value={capability}>
                    {capability}
                  </option>
                ))}
              </select>
              <select
                value={newRouteProviderKey}
                onChange={(event) => {
                  setNewRouteProviderKey(event.target.value);
                  setNewRouteModelKey("");
                }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                <option value="">provider</option>
                {providersSettings
                  .map((item) => toText(asMetadataObject(item.metadata).key, String(item.key)))
                  .filter((providerKey, index, all) => all.indexOf(providerKey) === index)
                  .sort()
                  .map((providerKey) => (
                    <option key={providerKey} value={providerKey}>
                      {providerKey}
                    </option>
                  ))}
              </select>
              <select
                value={newRouteModelKey}
                onChange={(event) => setNewRouteModelKey(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                <option value="">model</option>
                {addModelOptions.map((model) => (
                  <option key={`${model.providerKey}:${model.modelKey}`} value={model.modelKey}>
                    {model.modelKey}
                  </option>
                ))}
              </select>
              <select
                value={newRouteFallback}
                onChange={(event) => setNewRouteFallback(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                <option value="">fallback</option>
                {routeKeys
                  .filter((routeKey) => routeKey !== newKey.trim())
                  .map((routeKey) => (
                    <option key={routeKey} value={routeKey}>
                      {routeKey}
                    </option>
                  ))}
              </select>
              <label className="inline-flex items-center gap-2 text-xs text-white/75">
                <input
                  type="checkbox"
                  checked={newRouteEnabled}
                  onChange={(event) => setNewRouteEnabled(event.target.checked)}
                />
                enabled
              </label>
              <input
                value={newRouteTimeoutMs}
                onChange={(event) => setNewRouteTimeoutMs(event.target.value)}
                placeholder="timeoutMs"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <input
                value={newRouteMaxOutputTokens}
                onChange={(event) => setNewRouteMaxOutputTokens(event.target.value)}
                placeholder="maxOutputTokens"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
            </div>
            <textarea
              value={newRouteParams}
              onChange={(event) => setNewRouteParams(event.target.value)}
              placeholder="params JSON object"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
            />
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                canAddRoute && !rowBusy[addBusyIdentity]
                  ? "border-green/30 text-green"
                  : "border-white/10 text-white/30"
              }`}
              onClick={saveNewRouteSetting}
              disabled={!canAddRoute || rowBusy[addBusyIdentity]}
            >
              {rowBusy[addBusyIdentity] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Add / Upsert
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Provider</th>
                  <th>Model</th>
                  <th>Fallback</th>
                  <th>Enabled</th>
                  <th>Timeout</th>
                  <th>Max output</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routeRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-white/45">
                      No routes found.
                    </td>
                  </tr>
                ) : (
                  routeRows.map((item) => {
                    const identity = rowIdentity(item.section, item.key);
                    const metadata = asMetadataObject(item.metadata);
                    const metadataRouteKey = toText(metadata.routeKey, item.key);
                    const metadataProviderKey = toText(metadata.providerKey, "");
                    const metadataModelKey = toText(metadata.modelKey, "");
                    const metadataCapability = toText(metadata.capability, "image_generation");
                    const metadataFallback = metadata.fallbackRouteKey ? String(metadata.fallbackRouteKey) : "";
                    const metadataTitle = toText(metadata.title, metadataRouteKey);
                    const metadataEnabled = toBool(metadata.enabled, true);
                    const currentMetadataParams = normalizeMetadataValue(metadata.params);
                    const metadataTimeoutMs = toNumberText(metadata.timeoutMs);
                    const metadataMaxOutputTokens = toNumberText(metadata.maxOutputTokens);
                    const draft = routeDrafts[identity] ?? {
                      routeKey: metadataRouteKey,
                      title: metadataTitle,
                      capability: metadataCapability,
                      providerKey: metadataProviderKey,
                      modelKey: metadataModelKey,
                      fallbackRouteKey: metadataFallback,
                      enabled: metadataEnabled,
                      timeoutMs: metadataTimeoutMs,
                      maxOutputTokens: metadataMaxOutputTokens,
                      params: currentMetadataParams,
                    };
                    const modelOptions = getRouteModelOptions(draft.providerKey, draft.capability);
                    const hasChanges =
                      draft.title !== metadataTitle ||
                      draft.capability !== metadataCapability ||
                      draft.providerKey !== metadataProviderKey ||
                      draft.modelKey !== metadataModelKey ||
                      draft.fallbackRouteKey !== metadataFallback ||
                      draft.enabled !== metadataEnabled ||
                      draft.timeoutMs !== metadataTimeoutMs ||
                      draft.maxOutputTokens !== metadataMaxOutputTokens ||
                      draft.params !== currentMetadataParams;
                    const canSave = hasChanges && !rowBusy[identity];

                    return (
                      <tr key={`${item.section}:${item.key}`}>
                        <td className="font-semibold">{metadataRouteKey}</td>
                        <td>
                          <select
                            value={draft.providerKey}
                            onChange={(event) => {
                              const nextProviderKey = event.target.value;
                              const availableModels = getRouteModelOptions(nextProviderKey, draft.capability);
                              setRouteDrafts((prev) => ({
                                ...prev,
                                [identity]: {
                                  ...draft,
                                  providerKey: nextProviderKey,
                                  modelKey: availableModels.some((model) => model.modelKey === draft.modelKey)
                                    ? draft.modelKey
                                    : "",
                                },
                              }));
                            }}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          >
                            {providersSettings
                              .map((item) => toText(asMetadataObject(item.metadata).key, String(item.key)))
                              .filter((providerKey, index, all) => all.indexOf(providerKey) === index)
                              .sort()
                              .map((providerKey) => (
                                <option key={providerKey} value={providerKey}>
                                  {providerKey}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={draft.modelKey}
                            onChange={(event) =>
                              setRouteDrafts((prev) => ({ ...prev, [identity]: { ...draft, modelKey: event.target.value } }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          >
                            {modelOptions.length === 0 ? (
                              <option value="">no model</option>
                            ) : (
                              modelOptions.map((model) => (
                                <option key={`${model.providerKey}:${model.modelKey}`} value={model.modelKey}>
                                  {model.modelKey}
                                </option>
                              ))
                            )}
                          </select>
                        </td>
                        <td>
                          <select
                            value={draft.fallbackRouteKey}
                            onChange={(event) =>
                              setRouteDrafts((prev) => ({ ...prev, [identity]: { ...draft, fallbackRouteKey: event.target.value } }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          >
                            <option value="">—</option>
                            {routeKeys
                              .filter((routeKey) => routeKey !== metadataRouteKey)
                              .map((routeKey) => (
                                <option key={routeKey} value={routeKey}>
                                  {routeKey}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={draft.enabled}
                              onChange={(event) =>
                                setRouteDrafts((prev) => ({ ...prev, [identity]: { ...draft, enabled: event.target.checked } }))
                              }
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            value={draft.timeoutMs}
                            onChange={(event) =>
                              setRouteDrafts((prev) => ({
                                ...prev,
                                [identity]: { ...draft, timeoutMs: event.target.value },
                              }))
                            }
                            className="w-24 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <input
                            value={draft.maxOutputTokens}
                            onChange={(event) =>
                              setRouteDrafts((prev) => ({
                                ...prev,
                                [identity]: { ...draft, maxOutputTokens: event.target.value },
                              }))
                            }
                            className="w-24 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td className="flex gap-2">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-green/30 px-3 py-2 text-xs text-green ${
                              !canSave ? "opacity-50" : ""
                            }`}
                            onClick={() => canSave && void saveRouteSetting(item, draft)}
                            disabled={!canSave}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs ${
                              rowBusy[identity] ? "opacity-50" : "text-white/80 hover:bg-white/10"
                            }`}
                            onClick={() => !rowBusy[identity] && void testRoute(draft.routeKey)}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            Test
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPromptsSection = () => {
    const promptRows = sectionSettings;
    const routeKeys = getRouteKeys();
    const addBusyIdentity = rowIdentity(activeSection, newPromptKey);
    const canAddPrompt = newPromptKey.trim() && newPromptRouteKey && newPromptUserTemplate.trim();

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {ADMIN_SECTIONS.find((entry) => entry.id === activeSection)?.description}
        </p>
        <div className="glass-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight">Prompts settings</h3>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs" onClick={loadSectionData}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
          <div className="mb-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Add prompt</h4>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={newPromptKey}
                onChange={(event) => setNewPromptKey(event.target.value)}
                placeholder="promptKey"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <select
                value={newPromptRouteKey}
                onChange={(event) => setNewPromptRouteKey(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                <option value="">route</option>
                {routeKeys.map((routeKey) => (
                  <option key={routeKey} value={routeKey}>
                    {routeKey}
                  </option>
                ))}
              </select>
              <input
                value={newPromptVersion}
                onChange={(event) => setNewPromptVersion(event.target.value)}
                placeholder="version"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <select
                value={newPromptStatus}
                onChange={(event) => setNewPromptStatus(event.target.value as "draft" | "active" | "archived")}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                {promptStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                value={newPromptTitle}
                onChange={(event) => setNewPromptTitle(event.target.value)}
                placeholder="title"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <input
                value=""
                onChange={() => null}
                disabled
                placeholder="id auto-generated"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/40"
              />
              <textarea
                value={newPromptSystemPrompt}
                onChange={(event) => setNewPromptSystemPrompt(event.target.value)}
                placeholder="systemPrompt"
                rows={2}
                className="md:col-span-2 xl:col-span-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <textarea
                value={newPromptUserTemplate}
                onChange={(event) => setNewPromptUserTemplate(event.target.value)}
                placeholder="userTemplate"
                rows={3}
                className="md:col-span-2 xl:col-span-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <textarea
                value={newPromptJsonSchema}
                onChange={(event) => setNewPromptJsonSchema(event.target.value)}
                placeholder="jsonSchema (object)"
                rows={2}
                className="md:col-span-2 xl:col-span-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <textarea
                value={newPromptVariables}
                onChange={(event) => setNewPromptVariables(event.target.value)}
                placeholder="variables (array)"
                rows={2}
                className="md:col-span-2 xl:col-span-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
              <textarea
                value={newPromptMetadata}
                onChange={(event) => setNewPromptMetadata(event.target.value)}
                placeholder="metadata (object)"
                rows={2}
                className="md:col-span-2 xl:col-span-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              />
            </div>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                canAddPrompt && !rowBusy[addBusyIdentity] ? "border-green/30 text-green" : "border-white/10 text-white/30"
              }`}
              onClick={saveNewPromptSetting}
              disabled={!canAddPrompt || rowBusy[addBusyIdentity]}
            >
              {rowBusy[addBusyIdentity] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Add / Upsert
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Prompt Key</th>
                  <th>Route</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Title</th>
                  <th>systemPrompt</th>
                  <th>userTemplate</th>
                  <th>jsonSchema</th>
                  <th>variables</th>
                  <th>metadata</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promptRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center text-white/45">
                      No prompts found.
                    </td>
                  </tr>
                ) : (
                  promptRows.map((item) => {
                    const identity = rowIdentity(item.section, item.key);
                    const metadata = asMetadataObject(item.metadata);
                    const metadataPromptId = String(metadata.id ?? "");
                    const metadataPromptKey = toText(metadata.promptKey, item.key);
                    const metadataRouteKey = toText(metadata.routeKey, "");
                    const metadataVersion = metadata.version != null ? String(metadata.version) : "";
                    const metadataStatus = parsePromptStatus(metadata.status);
                    const metadataTitle = toText(metadata.title, "");
                    const metadataSystemPrompt = toText(metadata.systemPrompt, "");
                    const metadataUserTemplate = toText(metadata.userTemplate, "");
                    const metadataJsonSchema = normalizeMetadataValue(metadata.jsonSchema);
                    const metadataVariables = normalizeMetadataValue(metadata.variables);
                    const metadataMetadata = normalizeMetadataValue(metadata.metadata);
                    const draft = promptDrafts[identity] ?? {
                      promptId: metadataPromptId,
                      promptKey: metadataPromptKey,
                      routeKey: metadataRouteKey,
                      version: metadataVersion,
                      status: metadataStatus,
                      title: metadataTitle,
                      systemPrompt: metadataSystemPrompt,
                      userTemplate: metadataUserTemplate,
                      jsonSchema: metadataJsonSchema,
                      variables: metadataVariables,
                      metadata: metadataMetadata,
                    };
                    const hasChanges =
                      draft.promptKey !== metadataPromptKey ||
                      draft.routeKey !== metadataRouteKey ||
                      draft.version !== metadataVersion ||
                      draft.status !== metadataStatus ||
                      draft.title !== metadataTitle ||
                      draft.systemPrompt !== metadataSystemPrompt ||
                      draft.userTemplate !== metadataUserTemplate ||
                      normalizeMetadataValue(draft.jsonSchema) !== metadataJsonSchema ||
                      normalizeMetadataValue(draft.variables) !== metadataVariables ||
                      normalizeMetadataValue(draft.metadata) !== metadataMetadata;
                    const canSave = hasChanges && !rowBusy[identity];
                    const canTest = metadataPromptId.length > 0 && !rowBusy[identity];
                    const canActivate =
                      metadataPromptId.length > 0 && draft.status !== "active" && !rowBusy[identity];

                    return (
                      <tr key={`${item.section}:${item.key}`}>
                        <td>
                          <input
                            value={draft.promptKey}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({
                                ...prev,
                                [identity]: { ...draft, promptKey: event.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <select
                            value={draft.routeKey}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({
                                ...prev,
                                [identity]: { ...draft, routeKey: event.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          >
                            {routeKeys.map((routeKey) => (
                              <option key={routeKey} value={routeKey}>
                                {routeKey}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            value={draft.version}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, version: event.target.value } }))
                            }
                            className="w-20 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <select
                            value={draft.status}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({
                                ...prev,
                                [identity]: { ...draft, status: event.target.value as "draft" | "active" | "archived" },
                              }))
                            }
                            className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          >
                            {promptStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            value={draft.title}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, title: event.target.value } }))
                            }
                            className="w-44 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <textarea
                            value={draft.systemPrompt}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, systemPrompt: event.target.value } }))
                            }
                            rows={3}
                            className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <textarea
                            value={draft.userTemplate}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, userTemplate: event.target.value } }))
                            }
                            rows={3}
                            className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <textarea
                            value={draft.jsonSchema}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, jsonSchema: event.target.value } }))
                            }
                            rows={2}
                            className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <textarea
                            value={draft.variables}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, variables: event.target.value } }))
                            }
                            rows={2}
                            className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <textarea
                            value={draft.metadata}
                            onChange={(event) =>
                              setPromptDrafts((prev) => ({ ...prev, [identity]: { ...draft, metadata: event.target.value } }))
                            }
                            rows={2}
                            className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-xs"
                          />
                        </td>
                        <td className="flex gap-2">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-green/30 px-3 py-2 text-xs text-green ${
                              !canSave ? "opacity-50" : ""
                            }`}
                            onClick={() => canSave && void savePromptSetting(item, draft)}
                            disabled={!canSave}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs ${
                              !canTest ? "opacity-50" : "text-white/80 hover:bg-white/10"
                            }`}
                            onClick={() => canTest && void testPrompt(item, metadataPromptId)}
                            disabled={!canTest}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            Test
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-amber/30 px-3 py-2 text-xs ${
                              !canActivate ? "opacity-50" : "text-amber"
                            }`}
                            onClick={() => canActivate && void activatePrompt(item, metadataPromptId)}
                            disabled={!canActivate}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Activate
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    if (activeSection === "routes") return renderRoutesSection();
    if (activeSection === "prompts") return renderPromptsSection();
    if (activeSection !== "dashboard" && !isEditableSection) {
      return (
        <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-5">
          <p className="text-sm text-muted">
            {ADMIN_SECTIONS.find((entry) => entry.id === activeSection)?.description}
          </p>
          <p className="mt-3 text-xs uppercase tracking-wider text-white/55">
            This section is planned for stage 3 and currently kept for route structure.
          </p>
        </div>
      );
    }

    if (activeSection === "dashboard") {
      const totalSections = settingsResponse ? new Set(settingsResponse.settings.map((item) => item.section)).size : 0;
      const dbCount = settingsResponse ? settingsResponse.settings.filter((item) => item.source === "database").length : 0;

      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.17em] text-white/50">Models section</p>
              <p className="mt-2 text-2xl font-black">{settingsResponse ? modelsSettings.length : 0}</p>
              <p className="mt-1 text-xs text-muted">runtime keys in models</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.17em] text-white/50">DB overrides</p>
              <p className="mt-2 text-2xl font-black">{dbCount}</p>
              <p className="mt-1 text-xs text-muted">runtime settings in storage</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.17em] text-white/50">Sections in runtime</p>
              <p className="mt-2 text-2xl font-black">{totalSections}</p>
              <p className="mt-1 text-xs text-muted">total grouped sections</p>
            </div>
          </div>

          <div className="glass-card px-4 py-4">
            <h3 className="text-lg font-black uppercase tracking-tight">Env baseline keys</h3>
            <div className="mt-3 max-h-72 overflow-y-auto rounded-[16px] border border-white/10">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionStats.slice(0, 20).map((item) => (
                    <tr key={item.key}>
                      <td className="font-semibold">{item.key}</td>
                      <td className="text-right">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-white/50">
              Showing first 20 values from runtime env map.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">{ADMIN_SECTIONS.find((entry) => entry.id === activeSection)?.description}</p>

        <div className="glass-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight">
              {SECTION_LABEL_BY_ID[activeSection]} settings
            </h3>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs" onClick={loadSectionData}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-[1.2fr_1.8fr_120px_1fr]">
            <input
              value={newKey}
              onChange={(event) => setNewKey(event.target.value)}
              placeholder="new key"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
            />
            <input
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
              placeholder="new value"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
            />
            <label className="inline-flex items-center gap-2 text-xs text-white/75">
              <input
                type="checkbox"
                checked={newIsSecret}
                onChange={(event) => setNewIsSecret(event.target.checked)}
              />
              Secret
            </label>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                !newKey.trim() || !newValue.trim() || rowBusy[rowIdentity(activeSection, newKey)]
                  ? "border-white/10 text-white/30"
                  : "border-green/30 text-green"
              }`}
              onClick={saveNewSetting}
              disabled={!newKey.trim() || !newValue.trim() || rowBusy[rowIdentity(activeSection, newKey)]}
            >
              {rowBusy[rowIdentity(activeSection, newKey)] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Add / Upsert
            </button>
          </div>
          <textarea
            value={newMetadata}
            onChange={(event) => setNewMetadata(event.target.value)}
            placeholder="metadata JSON (object)"
            rows={3}
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
          />

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Effective value</th>
                  <th>Secret</th>
                  <th>Metadata</th>
                  <th>Source</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionSettings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-white/45">
                      No settings found in this section.
                    </td>
                  </tr>
                ) : (
                  sectionSettings.map((item) => {
                    const identity = rowIdentity(item.section, item.key);
                    const metadataValue = draftMetadataValues[identity] ?? "{}";
                    const normalizedCurrentMetadata = normalizeMetadataValue(item.metadata).trim();
                    const valueChanged = (draftValues[identity] ?? "") !== (item.value ?? item.effectiveValue);
                    const secretChanged = (draftSecretValues[identity] ?? item.isSecret) !== item.isSecret;
                    const metadataChanged = metadataValue.trim() !== normalizedCurrentMetadata;
                    const canSave = (valueChanged || secretChanged || metadataChanged) && !rowBusy[identity];
                    const canReset = item.source === "database" && !rowBusy[identity];

                    return (
                      <tr key={`${item.section}:${item.key}`}>
                        <td className="font-semibold">{item.key}</td>
                        <td>
                          <input
                            type="text"
                            value={draftValues[identity] ?? ""}
                            onChange={(event) =>
                              setDraftValues((prev) => ({ ...prev, [identity]: event.target.value }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
                          />
                        </td>
                        <td>
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={draftSecretValues[identity] ?? item.isSecret}
                              onChange={(event) =>
                                setDraftSecretValues((prev) => ({ ...prev, [identity]: event.target.checked }))
                              }
                            />
                            {item.isSecret ? "secret" : "visible"}
                          </label>
                        </td>
                        <td>
                          <textarea
                            value={draftMetadataValues[identity] ?? "{}"}
                            onChange={(event) =>
                              setDraftMetadataValues((prev) => ({ ...prev, [identity]: event.target.value }))
                            }
                            rows={4}
                            className="w-full min-w-[280px] rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
                          />
                          <p className="mt-1 text-[10px] text-white/50">
                            Must be a JSON object.
                          </p>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                              item.source === "database" ? "bg-green/10 text-green" : "bg-white/5 text-white/65"
                            }`}
                          >
                            {item.source}
                          </span>
                        </td>
                        <td>
                          {formatDate(item.updatedAt || item.createdAt)}
                        </td>
                        <td className="flex gap-2">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-green/30 px-3 py-2 text-xs text-green ${
                              !canSave ? "opacity-50" : ""
                            }`}
                            onClick={() => canSave && saveSetting(item)}
                            disabled={!canSave}
                          >
                            {rowBusy[identity] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs ${
                              !canReset ? "opacity-50" : "text-white/80 hover:bg-white/10"
                            }`}
                            onClick={() => canReset && resetSetting(item.section, item.key)}
                            disabled={!canReset}
                          >
                            <Trash2 size={14} />
                            Reset
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobileViewport) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-4">
        <div className="rounded-[18px] border border-orange-300/25 bg-orange-500/10 px-4 py-4 text-sm text-orange-200">
          <p className="font-black uppercase tracking-[0.2em] text-orange-300">Desktop only</p>
          <p className="mt-2 text-sm text-white/80">
            Панель /admin/ai работает только в desktop-режиме. Откройте раздел с экрана шириной 1024px и больше.
          </p>
          <p className="mt-2 text-xs text-white/60">
            Пришлите сессию позже с компьютера — сейчас функционал управления runtime-настройками не отображается на мобильном.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 xl:max-w-[1540px] xl:mx-auto">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] lg:items-start">
        <aside className="hidden lg:block">
          <div className="sticky top-3 glass-card border-white/10 p-4 space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Sections</p>
            <div className="space-y-2">
              {ADMIN_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(`admin/ai/${item.id}`)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide transition w-full ${
                    activeSection === item.id
                      ? "border-orange/30 bg-orange/10 text-orange"
                      : "border-white/10 bg-white/5 text-white/75 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="glass-card border-white/10 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-orange-300 uppercase tracking-[0.22em]">Admin</p>
                <h1 className="text-3xl leading-tight font-black tracking-tight uppercase xl:text-4xl">AI Runtime Settings</h1>
                <p className="text-sm text-muted">/admin/ai runtime overrides without editing .env.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                <ShieldCheck
                  size={14}
                  className={adminAuthError ? "text-yellow-500" : hasAdminAuth ? "text-green" : "text-yellow-500"}
                />
                {adminAuthError
                  ? "Admin key: invalid"
                  : hasAdminAuth
                    ? "Admin key: ready"
                    : "Admin key: not configured"}
              </div>
            </div>

            <div className="overflow-x-auto lg:hidden">
              <div className="flex gap-2 pb-1">
                {ADMIN_SECTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(`admin/ai/${item.id}`)}
                    className={`inline-flex min-w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                      activeSection === item.id
                        ? "border-orange/30 bg-orange/10 text-orange"
                        : "border-white/10 bg-white/5 text-white/75 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-white/65">
              {SECTION_LABEL_BY_ID[activeSection]} - {ADMIN_SECTIONS.find((entry) => entry.id === activeSection)?.description}
            </p>
          </div>

          {(!hasAdminAuth || adminAuthError) && (
            <div className="rounded-[18px] border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>
                  {adminAuthError
                    ? adminAuthError
                    : "To access /admin/ai, set VITE_ADMIN_KEY in frontend env or localStorage.adminAccessKey."}
                </span>
              </div>
              <div className="mt-3 flex max-w-md flex-wrap items-center gap-2">
                <input
                  type="password"
                  value={adminKeyInput}
                  onChange={(event) => setAdminKeyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      saveAdminKey();
                    }
                  }}
                  placeholder="Вставьте пароль доступа к админке"
                  className="h-10 flex-1 rounded-xl border border-amber/30 bg-black/20 px-3 text-sm"
                />
                <button
                  type="button"
                  className="rounded-xl border border-amber px-3 py-2 text-xs font-bold text-amber"
                  onClick={saveAdminKey}
                  disabled={!adminKeyInput.trim()}
                >
                  Войти
                </button>
                {hasAdminAuth && (
                  <button
                    type="button"
                    className="rounded-xl border border-white/30 px-3 py-2 text-xs text-white/70"
                    onClick={clearAdminKey}
                  >
                    Сменить ключ
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-[18px] border border-red/40 bg-red-500/10 px-4 py-3 text-sm text-red">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="rounded-[22px] border border-white/10 bg-[#08090a] p-3 xl:p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="text-orange animate-spin" />
              </div>
            ) : (
              renderSectionContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAiPage;
