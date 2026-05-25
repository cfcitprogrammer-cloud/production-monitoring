import ProductionForm from "../../components/prod-form";

export default function KFCantonFGForm() {
  return (
    <ProductionForm
      title="FG Form"
      skuTable="kf_sku"
      submitTable="kf_canton_fg"
      skuFilterValue="canton_fg"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
