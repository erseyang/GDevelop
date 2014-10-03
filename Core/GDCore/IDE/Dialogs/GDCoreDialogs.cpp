//////////////////////////////////////////////////////////////////////
// This file was auto-generated by codelite's wxCrafter Plugin
// wxCrafter project file: GDCoreDialogs.wxcp
// Do not modify this file by hand!
//////////////////////////////////////////////////////////////////////

#include "GDCoreDialogs.h"


// Declare the bitmap loading function
extern void wxC629BInitBitmapResources();

static bool bBitmapLoaded = false;


LayersEditorPanelBase::LayersEditorPanelBase(wxWindow* parent, wxWindowID id, const wxPoint& pos, const wxSize& size, long style)
    : wxPanel(parent, id, pos, size, style)
{
    if ( !bBitmapLoaded ) {
        // We need to initialise the default bitmap handler
        wxXmlResource::Get()->AddHandler(new wxBitmapXmlHandler);
        wxC629BInitBitmapResources();
        bBitmapLoaded = true;
    }
    
    m_auimgr = new wxAuiManager;
    m_auimgr->SetManagedWindow( this );
    m_auimgr->SetFlags( wxAUI_MGR_LIVE_RESIZE|wxAUI_MGR_TRANSPARENT_HINT|wxAUI_MGR_TRANSPARENT_DRAG|wxAUI_MGR_ALLOW_ACTIVE_PANE|wxAUI_MGR_ALLOW_FLOATING);
    m_auimgr->GetArtProvider()->SetMetric( wxAUI_DOCKART_PANE_BORDER_SIZE, 0);
    m_auimgr->GetArtProvider()->SetMetric(wxAUI_DOCKART_GRADIENT_TYPE, wxAUI_GRADIENT_NONE);
    
    m_toolbar = new wxAuiToolBar(this, wxID_ANY, wxDefaultPosition, wxSize(-1,-1), wxAUI_TB_PLAIN_BACKGROUND|wxAUI_TB_DEFAULT_STYLE);
    m_toolbar->SetToolBitmapSize(wxSize(16,16));
    
    m_auimgr->AddPane(m_toolbar, wxAuiPaneInfo().Caption(_("Layers editor")).Direction(wxAUI_DOCK_TOP).Layer(0).Row(0).Position(0).Fixed().CaptionVisible(false).MaximizeButton(false).CloseButton(false).MinimizeButton(false).PinButton(false));
    
    m_toolbar->AddTool(ADD_LAYER_TOOL, _("Add a layer"), wxXmlResource::Get()->LoadBitmap(wxT("add16")), wxNullBitmap, wxITEM_NORMAL, _("Add a new layer"), wxT(""), NULL);
    
    m_toolbar->AddTool(DELETE_LAYER_TOOL, _("Delete the selected layer"), wxXmlResource::Get()->LoadBitmap(wxT("delete16")), wxNullBitmap, wxITEM_NORMAL, _("Delete the selected layer"), wxT(""), NULL);
    
    m_toolbar->AddSeparator();
    
    m_toolbar->AddTool(EDIT_LAYER_TOOL, _("Edit the properties of the layer"), wxXmlResource::Get()->LoadBitmap(wxT("properties16")), wxNullBitmap, wxITEM_NORMAL, _("Edit the properties of the layer"), wxT(""), NULL);
    
    m_toolbar->AddTool(LAYER_UP_TOOL, _("Move the layer over"), wxXmlResource::Get()->LoadBitmap(wxT("up16")), wxNullBitmap, wxITEM_NORMAL, _("Move the layer over"), wxT(""), NULL);
    
    m_toolbar->AddTool(LAYER_DOWN_TOOL, _("Move the layer below"), wxXmlResource::Get()->LoadBitmap(wxT("down16")), wxNullBitmap, wxITEM_NORMAL, _("Move the layer below"), wxT(""), NULL);
    
    m_toolbar->AddSeparator();
    
    m_toolbar->AddTool(REFRESH_TOOL, _("Refresh the list"), wxXmlResource::Get()->LoadBitmap(wxT("refreshicon")), wxNullBitmap, wxITEM_NORMAL, _("Refresh the list"), wxT(""), NULL);
    
    m_toolbar->AddSeparator();
    
    m_toolbar->AddTool(HELP_TOOL, _("Help"), wxXmlResource::Get()->LoadBitmap(wxT("help16")), wxNullBitmap, wxITEM_NORMAL, _("Display help about the layers editor"), wxT(""), NULL);
    m_toolbar->Realize();
    
    m_panel7 = new wxPanel(this, wxID_ANY, wxDefaultPosition, wxSize(-1,-1), wxTAB_TRAVERSAL);
    
    m_auimgr->AddPane(m_panel7, wxAuiPaneInfo().Direction(wxAUI_DOCK_CENTER).Layer(0).Row(0).Position(0).BestSize(100,100).MinSize(100,100).MaxSize(100,100).CaptionVisible(false).MaximizeButton(false).CloseButton(false).MinimizeButton(false).PinButton(false));
    m_auimgr->Update();
    
    wxFlexGridSizer* flexGridSizer13 = new wxFlexGridSizer(1, 1, 0, 0);
    flexGridSizer13->SetFlexibleDirection( wxBOTH );
    flexGridSizer13->SetNonFlexibleGrowMode( wxFLEX_GROWMODE_SPECIFIED );
    flexGridSizer13->AddGrowableCol(0);
    flexGridSizer13->AddGrowableRow(0);
    m_panel7->SetSizer(flexGridSizer13);
    
    m_layersList = new wxListCtrl(m_panel7, LAYERS_LIST_ID, wxDefaultPosition, wxDefaultSize, wxLC_REPORT);
    flexGridSizer13->Add(m_layersList, 0, wxALL|wxEXPAND, 0);
    
    SetSizeHints(500,300);
    if ( GetSizer() ) {
         GetSizer()->Fit(this);
    }
    Centre(wxBOTH);
    // Connect events
    this->Connect(ADD_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnAddLayerClicked), NULL, this);
    this->Connect(DELETE_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnDeleteLayerClicked), NULL, this);
    this->Connect(EDIT_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnEditLayerClicked), NULL, this);
    this->Connect(LAYER_UP_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnLayerUpClicked), NULL, this);
    this->Connect(LAYER_DOWN_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnLayerDownClicked), NULL, this);
    this->Connect(REFRESH_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnRefreshClicked), NULL, this);
    this->Connect(HELP_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnHelpClicked), NULL, this);
    
}

LayersEditorPanelBase::~LayersEditorPanelBase()
{
    this->Disconnect(ADD_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnAddLayerClicked), NULL, this);
    this->Disconnect(DELETE_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnDeleteLayerClicked), NULL, this);
    this->Disconnect(EDIT_LAYER_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnEditLayerClicked), NULL, this);
    this->Disconnect(LAYER_UP_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnLayerUpClicked), NULL, this);
    this->Disconnect(LAYER_DOWN_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnLayerDownClicked), NULL, this);
    this->Disconnect(REFRESH_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnRefreshClicked), NULL, this);
    this->Disconnect(HELP_TOOL, wxEVT_COMMAND_TOOL_CLICKED, wxCommandEventHandler(LayersEditorPanelBase::OnHelpClicked), NULL, this);
    
    m_auimgr->UnInit();
    delete m_auimgr;

}
