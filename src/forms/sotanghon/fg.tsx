import ProductionForm from "../../components/prod-form";

export default function SotanghonFGForm() {
  return (
    <ProductionForm
      title="FG Form"
      skuTable="kf_sku"
      submitTable="kf_fg"
      skuFilterValue="fg"
      valueField="qty"
      valueLabel="Cases/Bundles"
    />
  );
}
