import ProductionForm from "../../components/prod-form";

export default function CatmonMixingForm() {
  return (
    <ProductionForm
      title="Mixing Form"
      skuTable="catmon_sku"
      submitTable="catmon_mixing"
      skuFilterValue="mixing"
      valueField="weight"
      valueLabel="Weight"
    />
  );
}
