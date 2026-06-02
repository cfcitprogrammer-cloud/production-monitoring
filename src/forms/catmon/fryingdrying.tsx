import ProductionFormV2 from "../../components/prod-form-v2";

export default function CatmonFryingDryingForm() {
  return (
    <ProductionFormV2
      title="Frying Form"
      skuTable="catmon_sku"
      skuFilterColumn="type"
      skuFilterValue="frying"
      submitTable="catmon_frying_drying" // or custom combined logs
      fieldsConfig={[
        { key: "weight", label: "Weight" },
        { key: "dried", label: "Dried" },
      ]}
    />
  );
}
