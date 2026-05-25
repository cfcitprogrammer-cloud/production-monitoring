import ProductionForm from "../../components/prod-form";

export default function KFHEFGForm() {
  return (
    <ProductionForm
      title="FG Form"
      skuTable="kf_sku"
      submitTable="kf_he_fg"
      skuFilterValue="he_fg"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
