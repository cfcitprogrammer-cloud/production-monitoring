import ProductionForm from "../../components/prod-form";

export default function KFSFFGForm() {
  return (
    <ProductionForm
      title="FG Form"
      skuTable="kf_sku"
      submitTable="kf_sf_fg"
      skuFilterValue="sf_fg"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
