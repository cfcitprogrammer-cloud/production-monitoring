import ProductionForm from "../../components/prod-form";

export default function CatmonFryingDryingForm() {
  return (
    <ProductionForm
      title="Frying Form"
      skuTable="catmon_sku"
      submitTable="catmon_frying_drying"
      skuFilterValue="frying"
      valueField="weight"
      valueLabel="Weight"
    />
  );
}
