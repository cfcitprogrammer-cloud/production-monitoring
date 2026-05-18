import ProductionForm from "../../components/prod-form";

export default function CatmonFryingDryingForm() {
  return (
    <ProductionForm
      title="Frying/Drying Form"
      skuTable="catmon_sku"
      submitTable="catmon_frying_drying"
      skuFilterValue="frying_drying"
      valueField="weight"
      valueLabel="Weight"
    />
  );
}
